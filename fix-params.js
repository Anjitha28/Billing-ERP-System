const fs = require('fs');
const path = require('path');

const files = [
  "app/(dashboard)/vendors/[id]/page.tsx",
  "app/(dashboard)/vendors/[id]/edit/page.tsx",
  "app/(dashboard)/proforma-invoices/[id]/page.tsx",
  "app/(dashboard)/proforma-invoices/[id]/edit/page.tsx",
  "app/(dashboard)/products/[id]/page.tsx",
  "app/(dashboard)/products/[id]/edit/page.tsx",
  "app/(dashboard)/expenses/[id]/edit/page.tsx",
  "app/(dashboard)/expenses/[id]/page.tsx",
  "app/(dashboard)/invoices/[id]/page.tsx",
  "app/(dashboard)/customers/[id]/edit/page.tsx",
  "app/(dashboard)/customers/[id]/page.tsx"
];

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // 1. Convert `params: { id: string }` to `params: Promise<{ id: string }>`
  content = content.replace(/params\s*:\s*\{\s*id\s*:\s*string\s*\}/g, 'params: Promise<{ id: string }>');
  
  // 2. We need to find the function body start. 
  // Function signature could be `export default async function Page({ params }: { params: Promise<{ id: string }> }) {`
  // We can just find `}) {` which ends the parameter list.
  const signatureEnd = content.indexOf('}) {');
  if (signatureEnd !== -1) {
    const insertPos = signatureEnd + 4;
    content = content.slice(0, insertPos) + '\n  const resolvedParams = await params;\n  const id = resolvedParams.id;' + content.slice(insertPos);
    
    // Replace all remaining `params.id` with `id`
    content = content.replace(/params\.id/g, 'id');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
      // maybe `}) \n {`
      const match = content.match(/\}\)\s*\{/);
      if (match) {
          const insertPos = match.index + match[0].length;
          content = content.slice(0, insertPos) + '\n  const resolvedParams = await params;\n  const id = resolvedParams.id;' + content.slice(insertPos);
          content = content.replace(/params\.id/g, 'id');
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated ${file}`);
      } else {
        console.log(`Failed to find insertion point in ${file}`);
      }
  }
}
