// Shared form logic utilities used by both FormRenderer and PreviewPanel

export interface LogicCondition {
  id: string;
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface LogicActions {
  jumpToStep?: string;
  showFields?: string[];
  hideFields?: string[];
  requireFields?: string[];
  hideStep?: string;
  showStep?: string;
}

export interface LogicRule {
  id: string;
  stepId: string;
  conditions: LogicCondition[];
  actions: LogicActions;
}

export interface LoopConfig {
  enabled: boolean;
  sourceFieldId: string;
}

export interface Question {
  id: string;
  type: 'text_input' | 'email_input' | 'number_input' | 'phone_input' | 'single_choice' | 'multiple_choice' | 'date_picker' | 'file_upload' | 'textarea';
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  validation?: ValidationRule[];
  options?: ChoiceOption[];
  settings?: Record<string, any>;
}

export interface ValidationRule {
  type: 'required' | 'min_length' | 'max_length' | 'email' | 'url' | 'regex';
  value?: any;
  message: string;
}

export interface ChoiceOption {
  value: string;
  label: string;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    required?: boolean;
    validation?: ValidationRule[];
    options?: ChoiceOption[];
    settings?: Record<string, any>;
    questions?: Question[];
    logic?: LogicRule[];
    loop?: LoopConfig;
  };
  connections: { targetNodeId: string }[];
}

export interface Flow {
  id: string;
  title: string;
  description?: string;
  nodes: FlowNode[];
  settings?: {
    allowMultipleSubmissions?: boolean;
    showProgressBar?: boolean;
    requireAuth?: boolean;
    collectAnalytics?: boolean;
    redirectUrl?: string;
    webhookUrl?: string;
  };
  theme?: any;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  version?: string;
}

/**
 * Evaluates a single condition against form values
 */
export const evaluateCondition = (condition: LogicCondition, formValues: Record<string, any>): boolean => {
  const fieldValue = formValues[condition.fieldId];

  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'not_equals':
      return fieldValue !== condition.value;
    case 'contains':
      return fieldValue && fieldValue.toString().includes(condition.value);
    case 'greater_than':
      return fieldValue && Number(fieldValue) > Number(condition.value);
    case 'less_than':
      return fieldValue && Number(fieldValue) < Number(condition.value);
    default:
      return true;
  }
};

/**
 * Evaluates multiple logic rules and returns combined results
 */
export const evaluateLogicRules = (rules: LogicRule[], formValues: Record<string, any>) => {
  let show = true;
  let required = false;
  let jumpToStep: string | undefined;

  rules.forEach(rule => {
    // All conditions must be true (AND logic)
    const conditionResults = rule.conditions.map(condition => 
      evaluateCondition(condition, formValues)
    );
    const ruleResult = conditionResults.every(result => result);

    if (ruleResult && rule.actions) {
      if (rule.actions.jumpToStep) {
        jumpToStep = rule.actions.jumpToStep;
      }
      if (rule.actions.hideFields) {
        show = false;
      }
      if (rule.actions.requireFields) {
        required = true;
      }
    }
  });

  return { show, required, jumpToStep };
};

/**
 * Evaluates step visibility based on all flow logic
 */
export const evaluateStepVisibility = (
  stepId: string,
  flow: Flow,
  formValues: Record<string, any>
): boolean => {
  let isVisible = true;

  // Check logic from all steps that might affect this step
  for (const node of flow.nodes) {
    if (node.data.logic) {
      node.data.logic.forEach(rule => {
        const conditionsMet = rule.conditions.every(condition =>
          evaluateCondition(condition, formValues)
        );

        if (conditionsMet && rule.actions) {
          if (rule.actions.hideStep === stepId) {
            isVisible = false;
          }
          if (rule.actions.showStep === stepId) {
            isVisible = true;
          }
        }
      });
    }
  }

  return isVisible;
};

/**
 * Evaluates field visibility and requirements based on all flow logic
 */
export const evaluateFieldLogic = (
  fieldId: string,
  flow: Flow,
  formValues: Record<string, any>
): { show: boolean; required: boolean } => {
  let show = true;
  let required = false;

  // Check logic from all steps that might affect this field
  for (const node of flow.nodes) {
    if (node.data.logic) {
      node.data.logic.forEach(rule => {
        const conditionsMet = rule.conditions.every(condition =>
          evaluateCondition(condition, formValues)
        );

        if (conditionsMet && rule.actions) {
          if (rule.actions.hideFields?.includes(fieldId)) {
            show = false;
          }
          if (rule.actions.showFields?.includes(fieldId)) {
            show = true;
          }
          if (rule.actions.requireFields?.includes(fieldId)) {
            required = true;
          }
        }
      });
    }
  }

  return { show, required };
};

/**
 * Gets all visible steps based on current form values
 */
export const getVisibleSteps = (flow: Flow, formValues: Record<string, any>): FlowNode[] => {
  const flowSteps = flow.nodes.filter(node => node.type === 'flow_step');
  
  return flowSteps.filter(step => 
    evaluateStepVisibility(step.id, flow, formValues)
  );
};

/**
 * Generates looped step instances based on loop configuration
 */
export const generateLoopedSteps = (
  step: FlowNode,
  formValues: Record<string, any>
): FlowNode[] => {
  if (!step.data.loop?.enabled || !step.data.loop.sourceFieldId) {
    return [step];
  }

  const loopCount = Number(formValues[step.data.loop.sourceFieldId]) || 0;
  const loopedSteps: FlowNode[] = [];

  for (let i = 0; i < loopCount; i++) {
    const loopedStep: FlowNode = {
      ...step,
      id: `${step.id}_loop_${i}`,
      data: {
        ...step.data,
        label: `${step.data.label} (${i + 1}/${loopCount})`,
        questions: step.data.questions?.map(question => ({
          ...question,
          id: `${question.id}_loop_${i}`,
          label: question.label
        }))
      }
    };
    loopedSteps.push(loopedStep);
  }

  return loopedSteps;
};
