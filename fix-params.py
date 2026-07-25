import os
import re

files = [
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
]

for file in files:
    full_path = os.path.join(os.getcwd(), file)
    if not os.path.exists(full_path):
        continue
        
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # First revert any partial changes
    content = content.replace('params: Promise<{ id: string }>', 'params: { id: string }')
    content = content.replace('const resolvedParams = await params;\n  const id = resolvedParams.id;\n', '')
    # We replaced params.id with id, but wait, if it was replaced globally we can't revert easily.
    # Let's hope it didn't apply. My previous script failed before writing because `match` was false.

    # Replace the type
    content = re.sub(r'params:\s*\{\s*id:\s*string\s*\}', r'params: Promise<{ id: string }>', content)
    
    match = re.search(r'export default async function.*?\)\s*\{', content, re.DOTALL)
    if match:
        end_idx = match.end()
        # insert
        content = content[:end_idx] + '\n  const resolvedParams = await params;\n  const id = resolvedParams.id;' + content[end_idx:]
        
        # replace params.id with id
        content = content.replace('params.id', 'id')
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {file}')
    else:
        print(f'Could not find function body for {file}')
