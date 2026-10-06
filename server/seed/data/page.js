import { completeSections } from '../../src/modules/page/page.sections.js';
import PageLayout from '../../src/modules/page/pageLayout.model.js';

/**
 * First run: the default home order, every section visible. Later runs keep the saved order and visibility
 * and only repair the key set (unknown / duplicate keys dropped, missing ones appended as visible).
 */
export default async function seedPage() {
  const existing = await PageLayout.findOne().select('sections').lean();
  await PageLayout.findOneAndUpdate(
    {},
    { sections: completeSections(existing?.sections) },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  return PageLayout.countDocuments();
}
