import { useState } from 'react';
import { GitBranch, AlertCircle, Eye, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { compareFlowVersions, getDiffSummary, type DiffResult, type Difference } from '../utils/diffUtils';

interface DraftStatusIndicatorProps {
  currentFlow: any;
  publishedFlow?: any; // เพิ่ม publishedFlow prop
  isVisible?: boolean;
}

export function DraftStatusIndicator({ currentFlow, publishedFlow, isVisible = true }: DraftStatusIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isVisible || !currentFlow) {
    return null;
  }

  // Compare draft vs published
  const diffResult: DiffResult = compareFlowVersions(
    currentFlow, // Current state (draft)
    publishedFlow || null // Published version
  );

  if (!diffResult.hasDifferences) {
    return null; // No differences, no need to show indicator
  }

  const summary = getDiffSummary(diffResult);
  const isNewFlow = !publishedFlow; // ใช้ publishedFlow แทน currentFlow.versions?.published

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isNewFlow ? (
            <AlertCircle className="h-5 w-5 text-amber-400" />
          ) : (
            <GitBranch className="h-5 w-5 text-amber-400" />
          )}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                {isNewFlow ? 'Flow ใหม่ที่ยังไม่ได้ Publish' : 'มีการเปลี่ยนแปลงที่ยังไม่ได้ Publish'}
              </h3>
              <div className="mt-1 text-sm text-amber-700">
                {isNewFlow ? 
                  'Flow นี้ยังไม่เคยถูก publish กด "Publish" เพื่อเผยแพร่' : 
                  summary
                }
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isNewFlow && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-amber-800 bg-amber-100 rounded-full hover:bg-amber-200 transition-colors"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  ดูรายละเอียด
                  {showDetails ? (
                    <ChevronUp className="w-3 h-3 ml-1" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Detailed differences */}
          {showDetails && !isNewFlow && (
            <div className="mt-3 space-y-2">
              <h4 className="text-xs font-medium text-amber-800 uppercase tracking-wide">
                รายการเปลี่ยนแปลง
              </h4>
              <div className="space-y-1">
                {diffResult.differences.map((diff: Difference, index: number) => (
                  <div key={index} className="flex items-start text-xs">
                    <div className="flex-shrink-0 w-16">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        diff.type === 'added' ? 'bg-green-100 text-green-700' :
                        diff.type === 'modified' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {diff.type === 'added' ? 'เพิ่ม' :
                         diff.type === 'modified' ? 'แก้ไข' : 'ลบ'}
                      </span>
                    </div>
                    <div className="ml-2 text-amber-700 flex-1">
                      {diff.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DraftStatusBadgeProps {
  currentFlow: any;
  publishedFlow?: any; // เพิ่ม publishedFlow prop
  size?: 'small' | 'medium';
}

export function DraftStatusBadge({ currentFlow, publishedFlow, size = 'medium' }: DraftStatusBadgeProps) {
  if (!currentFlow) return null;

  // Check if this is Dashboard data (no versions) vs Builder data (has versions)
  const hasVersionsData = !!currentFlow.versions;
  
  if (!hasVersionsData) {
    // Dashboard flow data - use simpler logic based on status
    // Only show badge for draft flows (not published)
    if (currentFlow.status !== 'draft') {
      return null; // Published flows don't need badge in dashboard
    }
    
    // Show "draft" badge for draft flows
    return (
      <div className={`inline-flex items-center ${
        size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
      } font-medium bg-amber-100 text-amber-800 rounded-full`}>
        <GitBranch className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        Draft
      </div>
    );
  }

  // Builder flow data - use full diff comparison
  const diffResult = compareFlowVersions(
    currentFlow,
    publishedFlow || null // ใช้ publishedFlow แทน currentFlow.versions?.published
  );

  if (!diffResult.hasDifferences) return null;

  const isNewFlow = !publishedFlow; // ใช้ publishedFlow แทน currentFlow.versions?.published

  return (
    <div className={`inline-flex items-center ${
      size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
    } font-medium bg-amber-100 text-amber-800 rounded-full`}>
      <GitBranch className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
      {isNewFlow ? 'ยังไม่ publish' : 'มีการแก้ไข'}
    </div>
  );
}

interface DraftDetailButtonProps {
  flowId: string;
  publishedFlow?: any; // เพิ่ม publishedFlow prop
  size?: 'small' | 'medium';
}

export function DraftDetailButton({ flowId, publishedFlow, size = 'medium' }: DraftDetailButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

  const loadDetailedDiff = async () => {
    if (diffResult) {
      setShowDetails(!showDetails);
      return;
    }

    setIsLoading(true);
    try {
      // โหลดข้อมูลแบบละเอียดจาก API
      const { flowsApi } = await import('../services/api');
      const detailedFlow = await flowsApi.getById(flowId);
      
      const result = compareFlowVersions(
        detailedFlow,
        publishedFlow || null // ใช้ publishedFlow แทน (detailedFlow as any).versions?.published
      );
      
      setDiffResult(result);
      setShowDetails(true);
    } catch (error) {
      console.error('Failed to load detailed diff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ถ้ายังไม่ได้โหลด หรือไม่มีการเปลี่ยนแปลง ไม่แสดงปุ่ม
  if (!diffResult && !isLoading) {
    return (
      <button
        onClick={loadDetailedDiff}
        className={`inline-flex items-center ${
          size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
        } font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors`}
        title="ดูรายละเอียดการเปลี่ยนแปลง"
      >
        <FileText className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        เช็คการเปลี่ยนแปลง
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className={`inline-flex items-center ${
        size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
      } font-medium text-gray-500`}>
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
        กำลังโหลด...
      </div>
    );
  }

  if (!diffResult || !diffResult.hasDifferences) {
    return (
      <div className={`inline-flex items-center ${
        size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
      } font-medium text-green-600`}>
        <Eye className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        ไม่มีการเปลี่ยนแปลง
      </div>
    );
  }

  const summary = getDiffSummary(diffResult);

  return (
    <div className="inline-block">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center ${
          size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
        } font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors`}
      >
        <GitBranch className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        {summary}
        {showDetails ? (
          <ChevronUp className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} ml-1`} />
        ) : (
          <ChevronDown className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} ml-1`} />
        )}
      </button>

      {/* Detailed differences */}
      {showDetails && (
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs">
          <h4 className="font-medium text-amber-800 mb-2">รายการเปลี่ยนแปลง</h4>
          <div className="space-y-1">
            {diffResult.differences.map((diff: Difference, index: number) => (
              <div key={index} className="flex items-start">
                <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full mr-2 ${
                  diff.type === 'added' ? 'bg-green-100 text-green-700' :
                  diff.type === 'modified' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {diff.type === 'added' ? 'เพิ่ม' :
                   diff.type === 'modified' ? 'แก้ไข' : 'ลบ'}
                </span>
                <div className="text-amber-700 flex-1 text-xs">
                  {diff.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
