const fs = require('fs');
let file = 'D:\\college-invitation-system\\src\\app\\compose\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Colors like bg-green-100, bg-purple-100
content = content.replace(/\bbg-green-100\b/g, 'bg-[rgba(34,197,94,0.1)]');
content = content.replace(/\bbg-purple-100\b/g, 'bg-[rgba(168,85,247,0.1)]');
content = content.replace(/\bbg-blue-100\b/g, 'bg-[rgba(59,130,246,0.1)]');

// Colors like border-green-300, border-purple-300
content = content.replace(/\bborder-green-300\b/g, 'border-[rgba(34,197,94,0.3)]');
content = content.replace(/\bborder-purple-300\b/g, 'border-[rgba(168,85,247,0.3)]');
content = content.replace(/\bborder-blue-300\b/g, 'border-[rgba(59,130,246,0.3)]');
content = content.replace(/\bborder-green-200\b/g, 'border-[rgba(34,197,94,0.2)]');
content = content.replace(/\bborder-purple-200\b/g, 'border-[rgba(168,85,247,0.2)]');
content = content.replace(/\bborder-blue-200\b/g, 'border-[rgba(59,130,246,0.2)]');

// Text colors remaining for some light modes
content = content.replace(/\btext-green-800\b/g, 'text-[#22c55e]');
content = content.replace(/\btext-purple-800\b/g, 'text-[#a855f7]');
content = content.replace(/\btext-blue-800\b/g, 'text-[#3b82f6]');

content = content.replace(/\btext-green-700\b/g, 'text-[#22c55e]');
content = content.replace(/\btext-purple-700\b/g, 'text-[#a855f7]');
content = content.replace(/\btext-blue-700\b/g, 'text-[#3b82f6]');

// Fix remaining input class replacements that might have been unhandled
content = content.replace(/className="[^"]*border border-\[var\(--border-input\)\] rounded-xl[^"]*"/g, 'className="input-field mb-4"');
content = content.replace(/className="[^"]*border border-\[var\(--border-input\)\] rounded-lg text-sm[^"]*"/g, 'className="input-field"');
content = content.replace(/className="[^"]*border border-\[rgba[^\]]+\] rounded-xl[^"]*"/g, 'className="input-field mb-4"');
content = content.replace(/className="[^"]*border border-\[rgba[^\]]+\] rounded-lg text-sm[^"]*"/g, 'className="input-field"');

fs.writeFileSync(file, content);
console.log('done pass 2');
