const fs = require('fs');
let file = 'D:\\college-invitation-system\\src\\app\\compose\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Structural updates
content = content.replace(/className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6"/g, 'className="card-plain p-4 sm:p-6"');
content = content.replace(/className="lg:col-span-2 card-plain"/g, 'className="card-plain lg:col-span-2"');

// Backgrounds
content = content.replace(/\bbg-white\b/g, 'bg-[var(--bg-card)]');
content = content.replace(/\bbg-gray-50\b/g, 'bg-[var(--bg-row-alt)]');
content = content.replace(/\bbg-gray-100\b/g, 'bg-[var(--bg-table-hd)]');

// Gradients
content = content.replace(/bg-gradient-to-r from-blue-50 to-indigo-50/g, 'bg-[var(--bg-table-hd)] border-[var(--border-card)]');
content = content.replace(/bg-gradient-to-r from-green-50 to-emerald-50/g, 'bg-[var(--bg-table-hd)] border-[var(--border-card)]');
content = content.replace(/bg-gradient-to-r from-purple-50 to-blue-50/g, 'bg-[var(--bg-table-hd)] border-[var(--border-card)]');
content = content.replace(/bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50/g, 'bg-[var(--bg-table-hd)] border-[var(--border-card)]');
content = content.replace(/bg-gradient-to-r from-gray-50 to-gray-100/g, 'bg-[var(--bg-table-hd)] border-[var(--border-card)]');

// Text
content = content.replace(/\btext-gray-900\b/g, 'text-[var(--text-heading)]');
content = content.replace(/\btext-gray-800\b/g, 'text-[var(--text-primary)]');
content = content.replace(/\btext-gray-700\b/g, 'text-[var(--text-primary)]');
content = content.replace(/\btext-gray-600\b/g, 'text-[var(--text-muted)]');
content = content.replace(/\btext-gray-500\b/g, 'text-[var(--text-muted)]');

// Borders
content = content.replace(/\bborder-gray-100\b/g, 'border-[var(--border-card)]');
content = content.replace(/\bborder-gray-200\b/g, 'border-[var(--border-card)]');
content = content.replace(/\bborder-gray-300\b/g, 'border-[var(--border-input)]');

// Inputs
content = content.replace(/className="w-full p-3 sm:p-4 border border-\[var\(--border-input\)\] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/g, 'className="input-field mb-2"');
content = content.replace(/className="p-3 sm:p-4 border border-\[var\(--border-input\)\] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/g, 'className="input-field"');
content = content.replace(/className="w-full mt-4 p-3 sm:p-4 border border-\[var\(--border-input\)\] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/g, 'className="input-field mt-4"');
content = content.replace(/className="w-full p-3 sm:p-4 border border-\[var\(--border-input\)\] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-96 font-mono text-sm transition-all"/g, 'className="input-field min-h-96 font-mono text-sm"');
content = content.replace(/className="p-2 sm:p-3 border border-\[var\(--border-input\)\] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"/g, 'className="input-field"');

fs.writeFileSync(file, content);
console.log('done');
