import type { RiskSignal } from '@onefootprint/request-types/dashboard';
import { Divider, Drawer, SearchInput, fromTopToTop } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useRiskSignalsSpec from 'src/hooks/use-risk-signals-spec';
import CategoryToggle from './components/category-toggle';
import { ReasonCodeCard } from './components/reason-code-card';
import SubcategoryToggle from './components/subcategory-toggle';

type RiskSignalsGlossaryProps = {
  open: boolean;
  onClose: () => void;
};

type RiskSignalCategory = {
  name: string;
  subCategories: Array<{
    name: string;
    reasonCodes: Array<RiskSignal>;
  }>;
};

type RiskSignalGroup = {
  category: Array<RiskSignalCategory>;
};

const RiskSignalsGlossary = ({ open, onClose }: RiskSignalsGlossaryProps) => {
  const riskSignalsQuery = useRiskSignalsSpec();
  const [showSubCategory, setShowSubCategory] = useState<string | null>(null);
  const [showReasonCodes, setShowReasonCodes] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { t } = useTranslation('common', {
    keyPrefix: 'components.risk-signals-glossary',
  });

  if (riskSignalsQuery.isPending || !riskSignalsQuery.data) {
    return null;
  }

  const allReasonCodes = Object.values(riskSignalsQuery.data as unknown as Record<string, RiskSignalGroup>).flatMap(
    ({ category }) => category.flatMap(({ subCategories }) => subCategories.flatMap(({ reasonCodes }) => reasonCodes)),
  );

  const filteredReasonCodes = searchTerm
    ? allReasonCodes.filter(
        reason =>
          reason.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reason.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const groupedCategories = !searchTerm
    ? Object.entries(riskSignalsQuery.data as unknown as Record<string, RiskSignalGroup>).reduce(
        (acc, [groupName, { category }]) => {
          acc[groupName] = category.reduce(
            (categoryAcc, { name: categoryName, subCategories }) => {
              categoryAcc[categoryName] = subCategories.reduce((subAcc, { name: subName, reasonCodes }) => {
                if (reasonCodes.length > 0) {
                  subAcc[subName] = [...(subAcc[subName] || []), ...reasonCodes];
                }
                return subAcc;
              }, categoryAcc[categoryName] || {});

              if (Object.keys(categoryAcc[categoryName]).length === 0) {
                delete categoryAcc[categoryName];
              }
              return categoryAcc;
            },
            {} as Record<string, Record<string, RiskSignal[]>>,
          );
          return acc;
        },
        {} as Record<string, Record<string, Record<string, RiskSignal[]>>>,
      )
    : {};

  const handleCategoryToggle = (categoryName: string) => {
    setShowSubCategory(prev => (prev === categoryName ? null : categoryName));
    setShowReasonCodes(null);
  };

  const handleSubcategoryToggle = (subCategoryName: string) => {
    setShowReasonCodes(prev => (prev === subCategoryName ? null : subCategoryName));
  };

  return (
    <Drawer open={open} title={t('title')} onClose={onClose}>
      <div className="pb-4">
        <SearchInput
          placeholder={t('search-placeholder')}
          onChange={e => setSearchTerm(e.target.value)}
          value={searchTerm}
          onReset={() => setSearchTerm('')}
        />
      </div>
      <Divider variant="secondary" />
      <div className="flex flex-col py-4">
        {searchTerm
          ? filteredReasonCodes.map(reason => <ReasonCodeCard key={reason.id} reason={reason} hasSubcategory={false} />)
          : Object.entries(groupedCategories).map(([groupName, categories]) => (
              <div key={groupName} className="flex flex-col mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="mb-2 capitalize text-label-2">{groupName}</h2>
                </div>
                {Object.entries(categories)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([categoryName, subCategories]) => {
                    const subCategoriesCount = Object.keys(subCategories).length;
                    const allReasonCodes = Object.values(subCategories).flat();

                    return (
                      <div key={categoryName} className="flex flex-col">
                        <CategoryToggle
                          categoryName={categoryName}
                          onClick={() => handleCategoryToggle(categoryName)}
                          isActive={showSubCategory === categoryName}
                        />
                        <AnimatePresence>
                          {showSubCategory === categoryName && (
                            <motion.div
                              className="relative pl-5"
                              variants={fromTopToTop}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              {subCategoriesCount === 1 ? (
                                <div className="relative">
                                  {allReasonCodes.map(reason => (
                                    <ReasonCodeCard key={reason.id} reason={reason} hasSubcategory={false} />
                                  ))}
                                </div>
                              ) : (
                                Object.entries(subCategories).map(([subCategoryName, reasonCodes]) => (
                                  <div key={subCategoryName} className="relative flex flex-col">
                                    <SubcategoryToggle
                                      subCategoryName={subCategoryName}
                                      onClick={() => handleSubcategoryToggle(subCategoryName)}
                                      isActive={showReasonCodes === subCategoryName}
                                    />
                                    <AnimatePresence>
                                      {showReasonCodes === subCategoryName && (
                                        <motion.div
                                          className="relative pl-2"
                                          variants={fromTopToTop}
                                          initial="hidden"
                                          animate="visible"
                                          exit="exit"
                                        >
                                          {reasonCodes.map(reason => (
                                            <ReasonCodeCard key={reason.id} reason={reason} hasSubcategory />
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
              </div>
            ))}
      </div>
    </Drawer>
  );
};

export default RiskSignalsGlossary;
