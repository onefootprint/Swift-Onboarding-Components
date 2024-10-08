import { customRender, screen, userEvent, waitForElementToBeRemoved, within } from '@onefootprint/test-utils';

import { EntityKind } from '@onefootprint/types';
import mockRouter from 'next-router-mock';
import type { EditTagsDialogProps } from './edit-tags-dialog';
import EditTagsDialog from './edit-tags-dialog';
import {
  entityIdFixture,
  entityWithTagsFixture,
  entityWithoutTagsFixture,
  getOrgTagsResponseFixture,
  withAddTag,
  withCreateOrgTag,
  withEntity,
  withOrgTags,
  withRemoveTag,
  withTags,
} from './edit-tags-dialog.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const renderDialog = ({
  entity = entityWithTagsFixture,
  open = true,
  onClose = jest.fn(),
  onSave = jest.fn(),
}: Partial<EditTagsDialogProps>) =>
  customRender(<EditTagsDialog entity={entity} open={open} onClose={onClose} onSave={onSave} />);

const renderDialogAndWaitFinishLoading = async (args: Partial<EditTagsDialogProps>) => {
  renderDialog(args);
  const loaders = await screen.findAllByRole('progressbar', {
    name: 'Loading...',
  });
  await waitForElementToBeRemoved(loaders);
};

describe('<EditTagsDialog />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/entities');
    mockRouter.query = {
      id: entityIdFixture,
    };
    withOrgTags();
  });

  it('should call close callback', async () => {
    withTags();
    withEntity();
    const onCloseMockFn = jest.fn();
    renderDialog({ onClose: onCloseMockFn });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);
    expect(onCloseMockFn).toHaveBeenCalled();
  });

  it('should show an empty message and all org tags as inactive if there are no active tags', async () => {
    withEntity(entityWithoutTagsFixture);
    withTags([]);
    renderDialogAndWaitFinishLoading({ entity: entityWithoutTagsFixture });

    const activeTags = await screen.findByRole('group', { name: 'Active tags' });
    expect(activeTags).toBeInTheDocument();
    const emptyText = await within(activeTags).findByText('There are no tags associated with this user yet');
    expect(emptyText).toBeInTheDocument();

    const inactiveTags = await screen.findByRole('group', { name: 'Inactive tags' });
    expect(inactiveTags).toBeInTheDocument();
    getOrgTagsResponseFixture.forEach(orgTag => {
      const inactiveTag = within(inactiveTags).getByText(orgTag.tag);
      expect(inactiveTag).toBeInTheDocument();
    });
  });

  it('should show active tags correctly', async () => {
    withTags();
    renderDialogAndWaitFinishLoading({});

    const activeTags = await screen.findByRole('group', { name: 'Active tags' });
    expect(activeTags).toBeInTheDocument();

    const loremTag = await within(activeTags).findByText('lorem');
    expect(loremTag).toBeInTheDocument();
    const ipsumTag = await within(activeTags).findByText('ipsum');
    expect(ipsumTag).toBeInTheDocument();
    const badTag = await within(activeTags).findByText('bad_actor');
    expect(badTag).toBeInTheDocument();
    const fraudulentTag = await within(activeTags).findByText('fraudulent');
    expect(fraudulentTag).toBeInTheDocument();
  });

  it('should allow removal of active tags', async () => {
    withTags();
    const onSave = jest.fn();
    withRemoveTag('tag_0');
    withRemoveTag('tag_3');
    renderDialogAndWaitFinishLoading({ onSave });

    // Remove lorem tag
    const activeTags = await screen.findByRole('group', { name: 'Active tags' });
    const loremTag = await within(activeTags).findByLabelText('lorem');
    const loremRemoveButton = within(loremTag).getByRole('button');
    await userEvent.click(loremRemoveButton);

    expect(within(activeTags).queryByText('lorem')).not.toBeInTheDocument();
    const inactiveTags = await screen.findByRole('group', { name: 'Inactive tags' });
    const inactiveLoremTag = within(inactiveTags).getByText('lorem');
    expect(inactiveLoremTag).toBeInTheDocument();

    // Remove fraudulent tag
    const fraudulentTag = await within(activeTags).findByLabelText('fraudulent');
    const fraudulentRemoveButton = within(fraudulentTag).getByRole('button');
    await userEvent.click(fraudulentRemoveButton);

    expect(within(activeTags).queryByText('fraudulent')).not.toBeInTheDocument();
    const inactiveFraudulentTag = within(inactiveTags).getByText('fraudulent');
    expect(inactiveFraudulentTag).toBeInTheDocument();

    // Save changes
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(saveButton);
    const args = {
      create: [],
      add: [],
      remove: [
        { id: entityIdFixture, tagId: 'tag_0' },
        { id: entityIdFixture, tagId: 'tag_3' },
      ],
    };
    expect(onSave).toHaveBeenCalledWith(args);
  });

  it('should allow addition of existing org tag', async () => {
    withTags();
    const onSave = jest.fn();
    withAddTag();
    renderDialogAndWaitFinishLoading({ onSave });

    // Add some_org_tag tag
    const inactiveTags = await screen.findByRole('group', { name: 'Inactive tags' });
    const someOrgTag = await within(inactiveTags).findByLabelText('some_org_tag');
    const someOrgTagAddButton = within(someOrgTag).getByRole('button');
    await userEvent.click(someOrgTagAddButton);

    expect(within(inactiveTags).queryByText('some_org_tag')).not.toBeInTheDocument();
    const activeTags = await screen.findByRole('group', { name: 'Active tags' });
    const activeSomeOrgTag = within(activeTags).getByText('some_org_tag');
    expect(activeSomeOrgTag).toBeInTheDocument();

    // Save changes
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(saveButton);
    const args = {
      create: [],
      add: [{ id: entityIdFixture, text: 'some_org_tag' }],
      remove: [],
    };
    expect(onSave).toHaveBeenCalledWith(args);
  });

  it('should allow creation of new org tags', async () => {
    withTags();
    const onSave = jest.fn();
    withAddTag();
    withCreateOrgTag();
    renderDialogAndWaitFinishLoading({ onSave });

    // Create new_user tag
    const addTagButton = await screen.findByRole('button', { name: 'Add custom tag' });
    await userEvent.click(addTagButton);

    const newUserTag = await screen.findByRole('textbox');
    await userEvent.type(newUserTag, 'new_user');
    await userEvent.keyboard('{Enter}');

    const activeTags = await screen.findByRole('group', { name: 'Active tags' });
    const activeNewUserTag = within(activeTags).getByText('new_user');
    expect(activeNewUserTag).toBeInTheDocument();

    // Save changes
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(saveButton);
    const args = {
      create: [
        {
          kind: EntityKind.person,
          text: 'new_user',
        },
      ],
      add: [
        {
          id: entityIdFixture,
          text: 'new_user',
        },
      ],
      remove: [],
    };
    expect(onSave).toHaveBeenCalledWith(args);
  });

  it('should allow a combination of remove, add, and create edits', async () => {
    withTags();
    const onSave = jest.fn();
    withRemoveTag('tag_2');
    withAddTag();
    withCreateOrgTag();
    renderDialog({ onSave });

    // Add another_org_tag tag
    const inactiveTags = await screen.findByRole('group', { name: 'Inactive tags' });
    const anotherOrgTag = await within(inactiveTags).findByLabelText('another_org_tag');
    const anotherOrgTagAddButton = within(anotherOrgTag).getByRole('button');
    await userEvent.click(anotherOrgTagAddButton);

    expect(within(inactiveTags).queryByText('another_org_tag')).not.toBeInTheDocument();
    const activeTags = await screen.findByRole('group', { name: 'Active tags' });
    const activeAnotherOrgTag = within(activeTags).getByText('another_org_tag');
    expect(activeAnotherOrgTag).toBeInTheDocument();

    // Create test tag
    const addTagButton = await screen.findByRole('button', { name: 'Add custom tag' });
    await userEvent.click(addTagButton);

    const newUserTag = await screen.findByRole('textbox');
    await userEvent.type(newUserTag, 'test');
    await userEvent.keyboard('{Enter}');

    const activeNewUserTag = within(activeTags).getByText('test');
    expect(activeNewUserTag).toBeInTheDocument();

    // Create then delete to_delete tag
    await userEvent.click(addTagButton);

    const toDeleteTag = await screen.findByRole('textbox');
    await userEvent.type(toDeleteTag, 'to_delete');
    await userEvent.keyboard('{Enter}');

    const activeToDeleteTag = within(activeTags).getByLabelText('to_delete');
    const toDeleteRemoveButton = within(activeToDeleteTag).getByRole('button');
    await userEvent.click(toDeleteRemoveButton);
    expect(screen.queryByText('to_delete')).not.toBeInTheDocument();

    // Remove bad_actor tag
    const badActorTag = await within(activeTags).findByLabelText('bad_actor');
    const badActorRemoveButton = within(badActorTag).getByRole('button');
    await userEvent.click(badActorRemoveButton);

    expect(within(activeTags).queryByText('bad_actor')).not.toBeInTheDocument();
    const inactiveBadActorTag = within(inactiveTags).getByText('bad_actor');
    expect(inactiveBadActorTag).toBeInTheDocument();

    // Save changes
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(saveButton);
    const args = {
      create: [
        {
          kind: EntityKind.person,
          text: 'test',
        },
      ],
      add: [
        { id: entityIdFixture, text: 'another_org_tag' },
        { id: entityIdFixture, text: 'test' },
      ],
      remove: [{ id: entityIdFixture, tagId: 'tag_2' }],
    };
    expect(onSave).toHaveBeenCalledWith(args);
  });
});
