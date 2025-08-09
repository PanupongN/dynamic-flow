const fs = require('fs');
const path = require('path');

const FLOWS_FILE = path.join(__dirname, '../data/flows.json');

console.log('🔄 Migrating flow structure: moving title/description from draft to root level...');

try {
  // Read current flows
  const flows = JSON.parse(fs.readFileSync(FLOWS_FILE, 'utf8'));
  console.log(`📂 Found ${flows.length} flows to migrate`);

  // Migrate each flow
  const migratedFlows = flows.map((flow, index) => {
    console.log(`\n🔧 Migrating flow ${index + 1}: ${flow.id}`);
    
    // Extract title/description from draft if exists
    const title = flow.draft?.title || flow.title || 'Untitled Flow';
    const description = flow.draft?.description || flow.description || '';
    
    console.log(`  📝 Title: "${title}"`);
    console.log(`  📄 Description: "${description}"`);
    
    // Create new draft without title/description
    const newDraft = { ...flow.draft };
    delete newDraft.title;
    delete newDraft.description;
    
    // Create migrated flow
    const migratedFlow = {
      ...flow,
      title,
      description,
      draft: newDraft
    };
    
    // Also update published if exists
    if (flow.published) {
      const newPublished = { ...flow.published };
      delete newPublished.title;
      delete newPublished.description;
      migratedFlow.published = newPublished;
    }
    
    console.log(`  ✅ Migrated successfully`);
    return migratedFlow;
  });

  // Write back migrated flows
  fs.writeFileSync(FLOWS_FILE, JSON.stringify(migratedFlows, null, 2));
  console.log(`\n🎉 Migration completed! Updated ${migratedFlows.length} flows`);
  console.log(`📁 File saved: ${FLOWS_FILE}`);

} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
