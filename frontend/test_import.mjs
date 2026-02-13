
import { parseAst } from 'rollup/parseAst';
console.log('Success! Imported parseAst.');
// Also check native binding if possible, but parseAst is pure JS usually (wrapper).
// However, the internal file imports native.js.
try {
  const result = parseAst('console.log("hello")', { allowReturnOutsideFunction: true });
  console.log('Parsed successfully:', result.type);
} catch (e) {
  console.error('Parsing failed:', e);
}
