import { IcoFileText24 } from 'icons';
import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import Accordion, { AccordionProps } from './accordion';

describe('<Accordion />', () => {
  const renderAccordion = ({
    children = 'Foo',
    iconComponent: Icon = IcoFileText24,
    onChange = jest.fn(),
    open = false,
    testID,
    title = 'Title',
  }: Partial<AccordionProps>) =>
    customRender(
      <Accordion
        iconComponent={Icon}
        onChange={onChange}
        open={open}
        testID={testID}
        title={title}
      >
        {children}
      </Accordion>,
    );

  it('should assign a testID', () => {
    renderAccordion({ testID: 'accordion-test-id' });
    expect(screen.getByTestId('accordion-test-id')).toBeInTheDocument();
  });

  it('should render the title', () => {
    renderAccordion({ title: 'Accordion title' });
    expect(screen.getByText('Accordion title')).toBeInTheDocument();
  });

  describe('when is not open', () => {
    it('should not render the children', () => {
      renderAccordion({ children: 'content', open: false });
      expect(screen.queryByText('content')).toBeNull();
    });
  });

  describe('when is open', () => {
    it('should render the children', () => {
      renderAccordion({ children: 'content', open: true });
      expect(screen.getByText('content')).toBeInTheDocument();
    });
  });

  describe('when clicking on the title', () => {
    it('should trigger onChange', async () => {
      const onChangeMockFn = jest.fn();
      renderAccordion({ title: 'Identity', onChange: onChangeMockFn });
      await userEvent.click(screen.getByText('Identity'));
      expect(onChangeMockFn).toHaveBeenCalled();
    });
  });
});
