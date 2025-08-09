// Utility functions for comparing draft and published versions

export interface DiffResult {
  hasDifferences: boolean;
  differences: Difference[];
}

// Deep compare two objects for equality
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

export interface Difference {
  type: 'added' | 'modified' | 'removed';
  section: 'title' | 'description' | 'steps' | 'fields' | 'logic' | 'settings' | 'theme';
  path: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

export function compareFlowVersions(currentFlow: any, published: any): DiffResult {
  const differences: Difference[] = [];



  if (!published) {
    return {
      hasDifferences: true,
      differences: [{
        type: 'added',
        section: 'title',
        path: 'entire_flow',
        newValue: currentFlow,
        description: 'ยังไม่เคย publish'
      }]
    };
  }

  // Helper function to normalize values for comparison
  const normalizeValue = (value: any): string => {
    if (value === undefined || value === null || value === 'undefined') {
      return '';
    }
    return String(value);
  };

  // Title และ description อยู่ที่ root level ของ flow, ไม่ใช่ใน draft/published objects
  // เราต้องเปรียบเทียบ current values (ที่ root) กับ published values (ที่ root เหมือนกัน)
  // แต่เนื่องจาก API ส่ง currentFlow เป็น draft data มาแล้ว เราเลยต้องเปรียบเทียบกับ 
  // metadata ของ published version ที่ควรจะเก็บไว้ที่ root level ของ published flow

  // สำหรับ title และ description: เปรียบเทียบ draft content (nodes, settings, theme) เท่านั้น
  // เพราะ title และ description ถูก update ที่ root level ตอน save แล้ว
  const draftContent = {
    nodes: currentFlow.nodes || [],
    settings: currentFlow.settings || {},
    theme: currentFlow.theme || {}
  };

  const publishedContent = {
    nodes: published.nodes || [],
    settings: published.settings || {},
    theme: published.theme || {}
  };

  // สำหรับ title และ description ให้ compare กับ root level ของ published
  // แต่ปัญหาคือ published ที่ส่งมาคือ published object ไม่ใช่ full flow
  // เราจึงต้องใช้ versions.published จาก currentFlow แทน
  const publishedFlow = currentFlow.versions?.published;
  


  // Compare title - เปรียบเทียบ current title กับ published title
  if (publishedFlow) {
    

    // Compare description - เปรียบเทียบ current description กับ published description  
    const draftDesc = normalizeValue(currentFlow.description);
    const publishedDesc = normalizeValue(publishedFlow.description);
    if (draftDesc !== publishedDesc && !(draftDesc === '' && publishedDesc === '')) {
      differences.push({
        type: 'modified',
        section: 'description',
        path: 'description',
        oldValue: publishedDesc,
        newValue: draftDesc,
        description: `เปลี่ยนคำอธิบายจาก "${publishedDesc || 'ไม่มีคำอธิบาย'}" เป็น "${draftDesc || 'ไม่มีคำอธิบาย'}"`
      });
    }
  }

  // Compare nodes/steps using content objects
  const draftNodes = draftContent.nodes || [];
  const publishedNodes = publishedContent.nodes || [];
  
  if (draftNodes.length !== publishedNodes.length) {
    differences.push({
      type: 'modified',
      section: 'steps',
      path: 'nodes.length',
      oldValue: publishedNodes.length,
      newValue: draftNodes.length,
      description: `จำนวน steps เปลี่ยนจาก ${publishedNodes.length} เป็น ${draftNodes.length}`
    });
  }

  // Compare individual steps
  draftNodes.forEach((draftNode: any, index: number) => {
    const publishedNode = publishedNodes[index];
    
    if (!publishedNode) {
      differences.push({
        type: 'added',
        section: 'steps',
        path: `nodes[${index}]`,
        newValue: draftNode,
        description: `เพิ่ม step ใหม่: "${draftNode.data?.label || 'Untitled'}"`
      });
      return;
    }

    // Compare step label
    if (draftNode.data?.label !== publishedNode.data?.label) {
      differences.push({
        type: 'modified',
        section: 'steps',
        path: `nodes[${index}].data.label`,
        oldValue: publishedNode.data?.label,
        newValue: draftNode.data?.label,
        description: `เปลี่ยนชื่อ step จาก "${publishedNode.data?.label}" เป็น "${draftNode.data?.label}"`
      });
    }

    // Compare questions/fields
    const draftQuestions = draftNode.data?.questions || [];
    const publishedQuestions = publishedNode.data?.questions || [];
    
    if (draftQuestions.length !== publishedQuestions.length) {
      differences.push({
        type: 'modified',
        section: 'steps',
        path: `nodes[${index}].data.questions.length`,
        oldValue: publishedQuestions.length,
        newValue: draftQuestions.length,
        description: `จำนวนคำถามใน step "${draftNode.data?.label}" เปลี่ยนจาก ${publishedQuestions.length} เป็น ${draftQuestions.length}`
      });
    }

    // Compare individual field properties
    draftQuestions.forEach((draftField: any, fieldIndex: number) => {
      const publishedField = publishedQuestions[fieldIndex];
      
      if (!publishedField) {
        differences.push({
          type: 'added',
          section: 'fields',
          path: `nodes[${index}].data.questions[${fieldIndex}]`,
          newValue: draftField,
          description: `เพิ่มคำถามใหม่: "${draftField.label}" ใน step "${draftNode.data?.label}"`
        });
        return;
      }

      // Compare field label
      if (draftField.label !== publishedField.label) {
        differences.push({
          type: 'modified',
          section: 'fields',
          path: `nodes[${index}].data.questions[${fieldIndex}].label`,
          oldValue: publishedField.label,
          newValue: draftField.label,
          description: `เปลี่ยนชื่อคำถามจาก "${publishedField.label}" เป็น "${draftField.label}" ใน step "${draftNode.data?.label}"`
        });
      }

      // Compare field type
      if (draftField.type !== publishedField.type) {
        differences.push({
          type: 'modified',
          section: 'fields',
          path: `nodes[${index}].data.questions[${fieldIndex}].type`,
          oldValue: publishedField.type,
          newValue: draftField.type,
          description: `เปลี่ยนประเภทคำถาม "${draftField.label}" จาก ${publishedField.type} เป็น ${draftField.type} ใน step "${draftNode.data?.label}"`
        });
      }

      // Compare field required status
      if (draftField.required !== publishedField.required) {
        differences.push({
          type: 'modified',
          section: 'fields',
          path: `nodes[${index}].data.questions[${fieldIndex}].required`,
          oldValue: publishedField.required,
          newValue: draftField.required,
          description: `เปลี่ยนสถานะ required ของคำถาม "${draftField.label}" เป็น ${draftField.required ? 'จำเป็น' : 'ไม่จำเป็น'} ใน step "${draftNode.data?.label}"`
        });
      }

      // Compare field placeholder
      if (draftField.placeholder !== publishedField.placeholder) {
        const draftPlaceholder = draftField.placeholder || '';
        const publishedPlaceholder = publishedField.placeholder || '';
        if (draftPlaceholder !== publishedPlaceholder) {
          differences.push({
            type: 'modified',
            section: 'fields',
            path: `nodes[${index}].data.questions[${fieldIndex}].placeholder`,
            oldValue: publishedPlaceholder,
            newValue: draftPlaceholder,
            description: `เปลี่ยน placeholder ของคำถาม "${draftField.label}" ใน step "${draftNode.data?.label}"`
          });
        }
      }

      // Compare field validation rules
      const draftValidation = draftField.validation || [];
      const publishedValidation = publishedField.validation || [];
      if (JSON.stringify(draftValidation) !== JSON.stringify(publishedValidation)) {
        differences.push({
          type: 'modified',
          section: 'fields',
          path: `nodes[${index}].data.questions[${fieldIndex}].validation`,
          oldValue: publishedValidation,
          newValue: draftValidation,
          description: `เปลี่ยนกฎการตรวจสอบของคำถาม "${draftField.label}" ใน step "${draftNode.data?.label}"`
        });
      }

      // Compare field options (for choice fields)
      if (draftField.options || publishedField.options) {
        const draftOptions = draftField.options || [];
        const publishedOptions = publishedField.options || [];
        if (JSON.stringify(draftOptions) !== JSON.stringify(publishedOptions)) {
          differences.push({
            type: 'modified',
            section: 'fields',
            path: `nodes[${index}].data.questions[${fieldIndex}].options`,
            oldValue: publishedOptions,
            newValue: draftOptions,
            description: `เปลี่ยนตัวเลือกของคำถาม "${draftField.label}" ใน step "${draftNode.data?.label}"`
          });
        }
      }

      // Compare field conditional display settings
      if (draftField.condition || publishedField.condition) {
        const draftCondition = draftField.condition;
        const publishedCondition = publishedField.condition;
        if (JSON.stringify(draftCondition) !== JSON.stringify(publishedCondition)) {
          differences.push({
            type: 'modified',
            section: 'logic',
            path: `nodes[${index}].data.questions[${fieldIndex}].condition`,
            oldValue: publishedCondition,
            newValue: draftCondition,
            description: `เปลี่ยนเงื่อนไขการแสดงของคำถาม "${draftField.label}" ใน step "${draftNode.data?.label}"`
          });
        }
      }

      // Compare field logic/behavior settings
      if (draftField.logic || publishedField.logic) {
        const draftFieldLogic = draftField.logic || {};
        const publishedFieldLogic = publishedField.logic || {};
        if (JSON.stringify(draftFieldLogic) !== JSON.stringify(publishedFieldLogic)) {
          differences.push({
            type: 'modified',
            section: 'logic',
            path: `nodes[${index}].data.questions[${fieldIndex}].logic`,
            oldValue: publishedFieldLogic,
            newValue: draftFieldLogic,
            description: `เปลี่ยนพฤติกรรมและ logic ของคำถาม "${draftField.label}" ใน step "${draftNode.data?.label}"`
          });
        }
      }
    });

    // Check for removed fields
    publishedQuestions.forEach((publishedField: any, fieldIndex: number) => {
      if (fieldIndex >= draftQuestions.length) {
        differences.push({
          type: 'removed',
          section: 'fields',
          path: `nodes[${index}].data.questions[${fieldIndex}]`,
          oldValue: publishedField,
          description: `ลบคำถาม: "${publishedField.label}" จาก step "${draftNode.data?.label}"`
        });
      }
    });

    // Compare step logic/conditions
    const draftLogic = draftNode.data?.logic || [];
    const publishedLogic = publishedNode.data?.logic || [];
    
    if (JSON.stringify(draftLogic) !== JSON.stringify(publishedLogic)) {
      differences.push({
        type: 'modified',
        section: 'logic',
        path: `nodes[${index}].data.logic`,
        oldValue: publishedLogic,
        newValue: draftLogic,
        description: `เปลี่ยนเงื่อนไขการแสดงใน step "${draftNode.data?.label}"`
      });
    }

    // Compare step loop settings
    const draftLoop = draftNode.data?.loop;
    const publishedLoop = publishedNode.data?.loop;
    
    if (JSON.stringify(draftLoop) !== JSON.stringify(publishedLoop)) {
      const draftEnabled = draftLoop?.enabled || false;
      const publishedEnabled = publishedLoop?.enabled || false;
      
      if (draftEnabled !== publishedEnabled) {
        differences.push({
          type: 'modified',
          section: 'logic',
          path: `nodes[${index}].data.loop.enabled`,
          oldValue: publishedEnabled,
          newValue: draftEnabled,
          description: `${draftEnabled ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'} loop ใน step "${draftNode.data?.label}"`
        });
      } else if (draftEnabled && publishedEnabled) {
        // Compare loop settings if both are enabled
        if (draftLoop?.sourceFieldId !== publishedLoop?.sourceFieldId) {
          differences.push({
            type: 'modified',
            section: 'logic',
            path: `nodes[${index}].data.loop.sourceFieldId`,
            oldValue: publishedLoop?.sourceFieldId,
            newValue: draftLoop?.sourceFieldId,
            description: `เปลี่ยน source field ของ loop ใน step "${draftNode.data?.label}"`
          });
        }
        
        if (draftLoop?.minCount !== publishedLoop?.minCount) {
          differences.push({
            type: 'modified',
            section: 'logic',
            path: `nodes[${index}].data.loop.minCount`,
            oldValue: publishedLoop?.minCount,
            newValue: draftLoop?.minCount,
            description: `เปลี่ยนจำนวนต่ำสุดของ loop ใน step "${draftNode.data?.label}" จาก ${publishedLoop?.minCount || 0} เป็น ${draftLoop?.minCount || 0}`
          });
        }
        
        if (draftLoop?.maxCount !== publishedLoop?.maxCount) {
          differences.push({
            type: 'modified',
            section: 'logic',
            path: `nodes[${index}].data.loop.maxCount`,
            oldValue: publishedLoop?.maxCount,
            newValue: draftLoop?.maxCount,
            description: `เปลี่ยนจำนวนสูงสุดของ loop ใน step "${draftNode.data?.label}" จาก ${publishedLoop?.maxCount || 'ไม่จำกัด'} เป็น ${draftLoop?.maxCount || 'ไม่จำกัด'}`
          });
        }
        
        if (draftLoop?.labelTemplate !== publishedLoop?.labelTemplate) {
          differences.push({
            type: 'modified',
            section: 'logic',
            path: `nodes[${index}].data.loop.labelTemplate`,
            oldValue: publishedLoop?.labelTemplate,
            newValue: draftLoop?.labelTemplate,
            description: `เปลี่ยนรูปแบบ label ของ loop ใน step "${draftNode.data?.label}"`
          });
        }
      }
    }

    // Compare node connections (conditional routing)
    const draftConnections = draftNode.connections || [];
    const publishedConnections = publishedNode.connections || [];
    
    if (JSON.stringify(draftConnections) !== JSON.stringify(publishedConnections)) {
      differences.push({
        type: 'modified',
        section: 'logic',
        path: `nodes[${index}].connections`,
        oldValue: publishedConnections,
        newValue: draftConnections,
        description: `เปลี่ยนการเชื่อมต่อและเงื่อนไขการไปขั้นตอนถัดไปจาก step "${draftNode.data?.label}"`
      });
    }
  });

  // Check for removed steps
  publishedNodes.forEach((publishedNode: any, index: number) => {
    if (index >= draftNodes.length) {
      differences.push({
        type: 'removed',
        section: 'steps',
        path: `nodes[${index}]`,
        oldValue: publishedNode,
        description: `ลบ step: "${publishedNode.data?.label || 'Untitled'}"`
      });
    }
  });

  // Compare theme (handle undefined values)
  const draftThemeId = draftContent.theme?.id || 'default';
  const publishedThemeId = publishedContent.theme?.id || 'default';
  
  if (draftThemeId !== publishedThemeId) {
    differences.push({
      type: 'modified',
      section: 'theme',
      path: 'theme.id',
      oldValue: publishedThemeId,
      newValue: draftThemeId,
      description: `เปลี่ยนธีมจาก "${publishedThemeId}" เป็น "${draftThemeId}"`
    });
  }

  // Compare settings (only compare defined values)
  const draftSettings = draftContent.settings || {};
  const publishedSettings = publishedContent.settings || {};
  
  Object.keys({...draftSettings, ...publishedSettings}).forEach(key => {
    const draftValue = draftSettings[key];
    const publishedValue = publishedSettings[key];
    
    // Skip comparison if both are undefined or if values are actually the same
    if (draftValue !== publishedValue && !(draftValue === undefined && publishedValue === undefined)) {
      differences.push({
        type: 'modified',
        section: 'settings',
        path: `settings.${key}`,
        oldValue: publishedValue,
        newValue: draftValue,
        description: `เปลี่ยนการตั้งค่า ${key} จาก ${publishedValue} เป็น ${draftValue}`
      });
    }
  });

  // If we have no differences detected, do a final deep comparison
  // to make sure we didn't miss anything due to data structure issues
  if (differences.length === 0) {
    const isReallyEqual = deepEqual(draftContent, publishedContent) && 
                         deepEqual(currentFlow.title, publishedFlow?.title) &&
                         deepEqual(currentFlow.description, publishedFlow?.description);
    if (!isReallyEqual) {
      // There are differences but we couldn't detect them specifically
      console.warn('Deep comparison shows differences but specific comparison did not detect them', {
        draftContent,
        publishedContent,
        currentTitle: currentFlow.title,
        publishedTitle: publishedFlow?.title
      });
    }
  }

  return {
    hasDifferences: differences.length > 0,
    differences
  };
}

export function getDiffSummary(diffResult: DiffResult): string {
  if (!diffResult.hasDifferences) {
    return 'ไม่มีการเปลี่ยนแปลง';
  }

  const { differences } = diffResult;
  const added = differences.filter(d => d.type === 'added').length;
  const modified = differences.filter(d => d.type === 'modified').length;
  const removed = differences.filter(d => d.type === 'removed').length;

  const parts = [];
  if (added > 0) parts.push(`เพิ่ม ${added} รายการ`);
  if (modified > 0) parts.push(`แก้ไข ${modified} รายการ`);
  if (removed > 0) parts.push(`ลบ ${removed} รายการ`);

  return parts.join(', ');
}
