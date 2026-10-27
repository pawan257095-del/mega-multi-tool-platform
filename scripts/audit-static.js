import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const toolsDir = path.join(root, "src", "app", "tools");
const componentsDir = path.join(root, "src", "components", "tools");
const registryFile = path.join(root, "src", "data", "tools.ts");
const cardFile = path.join(root, "src", "components", "tool-card.tsx");

function listDirs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}
function walk(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else result.push(full);
  }
  return result;
}

const registry = fs.readFileSync(registryFile, "utf8");
const card = fs.readFileSync(cardFile, "utf8");
const ids = [...registry.matchAll(/\bid:\s*["']([^"']+)["']/g)].map((m) => m[1]);
const routes = listDirs(toolsDir);
const mappingIds = [...card.matchAll(/["']([^"']+)["']\s*:\s*["']\/tools\/([^"']+)["']/g)].map((m) => m[1]);
const components = new Set(fs.readdirSync(componentsDir).filter((name) => name.endsWith(".tsx")));
const missingImports = [];
for (const file of walk(toolsDir).filter((file) => file.endsWith("page.tsx"))) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/from\s+["']@\/components\/tools\/([^"']+)["']/g)) {
    const component = match[1].endsWith(".tsx") ? match[1] : `${match[1]}.tsx`;
    if (!components.has(component)) missingImports.push(`${path.relative(root, file)} -> ${component}`);
  }
}
const checks = {
  routeCount: routes.length,
  catalogCount: ids.length,
  uniqueCatalogCount: new Set(ids).size,
  missingCatalogForRoutes: routes.filter((route) => !ids.includes(route)),
  missingRoutesForCatalog: [...new Set(ids)].filter((id) => !routes.includes(id)),
  missingExplicitMappings: [...new Set(ids)].filter((id) => !mappingIds.includes(id)),
  mappingsWithoutCatalog: [...new Set(mappingIds)].filter((id) => !ids.includes(id)),
  missingComponentImports: missingImports,
};
console.log(JSON.stringify(checks, null, 2));
const failures = checks.routeCount !== checks.catalogCount ||
  checks.catalogCount !== checks.uniqueCatalogCount ||
  checks.missingCatalogForRoutes.length ||
  checks.missingRoutesForCatalog.length ||
  checks.missingExplicitMappings.length ||
  checks.mappingsWithoutCatalog.length ||
  checks.missingComponentImports.length;
if (failures) process.exitCode = 1;
