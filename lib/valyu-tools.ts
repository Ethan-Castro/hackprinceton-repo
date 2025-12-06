import {
  webSearch,
  financeSearch,
  paperSearch,
  bioSearch,
  patentSearch,
  secSearch,
  economicsSearch,
  companyResearch,
} from "@valyu/ai-sdk";

// Rename Valyu's webSearch to avoid conflict with Exa's webSearch
export const valyuWebSearch = webSearch();

// Export all Valyu tools with their original names (except webSearch)
export const valyuTools = {
  valyuWebSearch,
  financeSearch: financeSearch(),
  paperSearch: paperSearch(),
  bioSearch: bioSearch(),
  patentSearch: patentSearch(),
  secSearch: secSearch(),
  economicsSearch: economicsSearch(),
  companyResearch: companyResearch(),
};
