import React from 'react';

// You can place these SVG components in a separate file or keep them here.
const CheckIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6 text-green-500 mx-auto" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={3}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const XMarkIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6 text-red-500 mx-auto" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={3}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// Data for the comparison table
type CellData = {
  type: 'icon' | 'text' | 'multiline';
  value?: string;
  isBold?: boolean;
  line1?: string;
  line2?: string;
};

type ComparisonFeature = {
  name: string;
  description: string;
  pegasus: CellData;
  codella: CellData;
  cynia: CellData;
};

const comparisonData: ComparisonFeature[] = [
  {
    name: 'Free Game Servers Included',
    description: '',
    pegasus: { type: 'icon', value: 'check' },
    codella: { type: 'icon', value: 'cross' },
    cynia: { type: 'icon', value: 'cross' },
  },
  {
    name: 'Premium Free Support',
    description: 'Access to a dedicated support team',
    pegasus: { type: 'icon', value: 'check' },
    codella: { type: 'icon', value: 'cross' },
    cynia: { type: 'icon', value: 'cross' },
  },
  {
    name: 'Automatic Error Detection & Fixer',
    description: '',
    pegasus: { type: 'icon', value: 'check' },
    codella: { type: 'icon', value: 'cross' },
    cynia: { type: 'icon', value: 'cross' },
  },
  {
    name: 'Platform Quality',
    description: 'Custom-built vs. template website',
    pegasus: { type: 'text', value: 'Custom-Built Platform', isBold: true },
    codella: { type: 'text', value: 'Basic Template' },
    cynia: { type: 'text', value: 'Basic Template' },
  },
  {
    name: 'Primary AI Model',
    description: 'The core model and its coding score',
    pegasus: { type: 'multiline', line1: 'Claude 4 Sonnet', line2: 'HumanEval: 92.0%' },
    codella: { type: 'multiline', line1: 'Gemini 1.5 Pro', line2: 'HumanEval: 84.1%' },
    cynia: { type: 'multiline', line1: 'Deepseek Coder v1', line2: 'HumanEval: 73.8%' },
  },
  {
    name: 'Unlimited Generations',
    description: 'Can you make unlimited prompts?',
    pegasus: { type: 'icon', value: 'check' },
    codella: { type: 'icon', value: 'check' },
    cynia: { type: 'icon', value: 'check' },
  },
  {
    name: 'Core Service',
    description: 'What is the main generation type?',
    pegasus: { type: 'text', value: 'Minecraft Spigot Plugin Creator' },
    codella: { type: 'text', value: 'Minecraft Spigot Plugin Creator' },
    cynia: { type: 'text', value: 'Plugin Creator & Build Generator' },
  },
  {
    name: 'Pricing Model',
    description: '',
    pegasus: { type: 'text', value: 'Low-Cost Subscription' },
    codella: { type: 'text', value: 'Credit System' },
    cynia: { type: 'text', value: 'BYOC / Credits' },
  },
  {
    name: 'Free Tier Available',
    description: '',
    pegasus: { type: 'text', value: '100K Tokens' },
    codella: { type: 'icon', value: 'cross' },
    cynia: { type: 'icon', value: 'cross' },
  },
];

const renderCellContent = (cellData: CellData) => {
    if (!cellData) return null;

    switch (cellData.type) {
        case 'icon':
            return cellData.value === 'check' ? <CheckIcon /> : <XMarkIcon />;
        case 'text':
            return <span className={cellData.isBold ? "font-semibold" : ""}>{cellData.value}</span>;
        case 'multiline':
            return (
                <div>
                    <span>{cellData.line1}</span>
                    <br />
                    <span className="text-gray-400">{cellData.line2}</span>
                </div>
            );
        default:
            return null;
    }
};

const ComparisonTable = () => {
  return (
    <div className="bg-gray-900 text-white font-sans p-4 sm:p-8 rounded-lg w-full max-w-5xl mx-auto">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-base">
          <thead>
            <tr className="border-b border-gray-700">
              <th scope="col" className="py-5 px-4 text-left font-medium text-lg">Feature</th>
              <th scope="col" className="py-5 px-4 text-center font-semibold text-lg">Pegasus Labs</th>
              <th scope="col" className="py-5 px-4 text-center font-semibold text-lg">Codella</th>
              <th scope="col" className="py-5 px-4 text-center font-semibold text-lg">Cynia AI</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((feature, index) => (
              <tr key={index} className="border-b border-gray-700 last:border-b-0">
                <th scope="row" className="py-6 px-4 text-left align-top">
                  <div className="font-semibold text-white">{feature.name}</div>
                  {feature.description && (
                    <div className="font-normal text-gray-400 text-sm mt-1">{feature.description}</div>
                  )}
                </th>
                <td className="py-6 px-4 text-center align-middle">{renderCellContent(feature.pegasus)}</td>
                <td className="py-6 px-4 text-center align-middle">{renderCellContent(feature.codella)}</td>
                <td className="py-6 px-4 text-center align-middle">{renderCellContent(feature.cynia)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-8">
        Disclaimer: The information presented in this table was gathered from publicly available, open-source routes on July 12, 2025. This data may not be fully up-to-date or accurate. Please conduct your own research for the most current information.
      </p>
    </div>
  );
};

export default ComparisonTable;