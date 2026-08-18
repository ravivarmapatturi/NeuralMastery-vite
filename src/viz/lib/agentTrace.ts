// Illustrative ReAct traces for the Agent Execution Graph visualization.
// These are scripted, representative examples (not a live model) -- there's no
// LLM running in the browser here, unlike the other from-scratch visualizations
// in this lab. The point is to make the *shape* of the reason/act/observe loop
// tangible and clickable, not to demonstrate real inference.

export type StepType = 'thought' | 'action' | 'observation' | 'answer';

export interface AgentStep {
  type: StepType;
  title: string;
  detail: string;
}

export interface Scenario {
  label: string;
  query: string;
  steps: AgentStep[];
}

export const SCENARIOS: Record<string, Scenario> = {
  weather: {
    label: 'Weather lookup',
    query: 'What’s the current weather in the capital of France, in Fahrenheit?',
    steps: [
      { type: 'thought', title: 'Thought', detail: 'I need the capital of France, then its current weather, then I’ll need to convert Celsius to Fahrenheit.' },
      { type: 'action', title: 'Action', detail: 'search(query="capital of France")' },
      { type: 'observation', title: 'Observation', detail: 'Paris is the capital of France.' },
      { type: 'thought', title: 'Thought', detail: 'Now I need the current weather in Paris.' },
      { type: 'action', title: 'Action', detail: 'get_weather(city="Paris")' },
      { type: 'observation', title: 'Observation', detail: '18°C, partly cloudy (demo data).' },
      { type: 'thought', title: 'Thought', detail: '18×9/5+32 = 64.4. I have both facts I need -- ready to answer.' },
      { type: 'answer', title: 'Answer', detail: 'It’s currently 64.4°F and partly cloudy in Paris, the capital of France.' },
    ],
  },
  marketcap: {
    label: 'Company lookup',
    query: 'How many employees does the company with the highest market cap have?',
    steps: [
      { type: 'thought', title: 'Thought', detail: 'First I need to find which public company currently has the highest market cap.' },
      { type: 'action', title: 'Action', detail: 'search(query="company with highest market cap")' },
      { type: 'observation', title: 'Observation', detail: '"Company X" has the highest market cap at $3.5T (demo data).' },
      { type: 'thought', title: 'Thought', detail: 'Now I need that company’s employee count.' },
      { type: 'action', title: 'Action', detail: 'search(query="Company X employee count")' },
      { type: 'observation', title: 'Observation', detail: 'Company X employs approximately 164,000 people (demo data).' },
      { type: 'thought', title: 'Thought', detail: 'I have both facts needed -- ready to answer.' },
      { type: 'answer', title: 'Answer', detail: 'The company with the highest market cap ("Company X") employs about 164,000 people.' },
    ],
  },
};

export const STEP_NODE: Record<StepType, StepType> = {
  thought: 'thought',
  action: 'action',
  observation: 'observation',
  answer: 'answer',
};
