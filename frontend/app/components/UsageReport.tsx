'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface TokenUsage {
  input_tokens: number
  output_tokens: number
  audio_input_tokens?: number
  image_count?: number
}

interface CostCalculation {
  input_cost: number
  output_cost: number
  audio_cost: number
  image_cost: number
  total_cost: number
}

interface UsageReport {
  task_id: string
  service_type: string
  timestamp: string
  token_usage: TokenUsage
  cost_calculation: CostCalculation
}

interface UsageReportProps {
  usageReport: UsageReport
}

export default function UsageReport({ usageReport }: UsageReportProps) {
  const { token_usage, cost_calculation, service_type } = usageReport
  
  // 格式化費用顯示
  const formatCost = (cost: number) => {
    return cost < 0.01 ? '< $0.01' : `$${cost.toFixed(4)}`
  }
  
  // 格式化 token 數量
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(2)}M`
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`
    }
    return tokens.toString()
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📊 使用量報告</span>
          <Badge variant="outline">
            {service_type === 'meeting_notes' ? '會議筆記' : '圖標生成'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token 使用量 */}
        <div>
          <h4 className="font-medium mb-2">Token 使用量</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {token_usage.input_tokens > 0 && (
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-blue-600 font-medium">文字輸入</div>
                <div className="text-blue-800">{formatTokens(token_usage.input_tokens)}</div>
              </div>
            )}
            
            {token_usage.audio_input_tokens && token_usage.audio_input_tokens > 0 && (
              <div className="bg-purple-50 p-2 rounded">
                <div className="text-purple-600 font-medium">音頻輸入</div>
                <div className="text-purple-800">{formatTokens(token_usage.audio_input_tokens)}</div>
              </div>
            )}
            
            {token_usage.output_tokens > 0 && (
              <div className="bg-green-50 p-2 rounded">
                <div className="text-green-600 font-medium">輸出</div>
                <div className="text-green-800">{formatTokens(token_usage.output_tokens)}</div>
              </div>
            )}
            
            {token_usage.image_count && token_usage.image_count > 0 && (
              <div className="bg-orange-50 p-2 rounded">
                <div className="text-orange-600 font-medium">圖片生成</div>
                <div className="text-orange-800">{token_usage.image_count} 張</div>
              </div>
            )}
          </div>
        </div>
        
        <Separator />
        
        {/* 費用明細 */}
        <div>
          <h4 className="font-medium mb-2">費用明細 (USD)</h4>
          <div className="space-y-2 text-sm">
            {cost_calculation.input_cost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">文字輸入處理</span>
                <span>{formatCost(cost_calculation.input_cost)}</span>
              </div>
            )}
            
            {cost_calculation.audio_cost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">音頻處理</span>
                <span>{formatCost(cost_calculation.audio_cost)}</span>
              </div>
            )}
            
            {cost_calculation.output_cost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">內容生成</span>
                <span>{formatCost(cost_calculation.output_cost)}</span>
              </div>
            )}
            
            {cost_calculation.image_cost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">圖片生成</span>
                <span>{formatCost(cost_calculation.image_cost)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-medium text-base">
              <span>總費用</span>
              <span className="text-blue-600">{formatCost(cost_calculation.total_cost)}</span>
            </div>
          </div>
        </div>
        
        {/* 價格說明 */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <div className="font-medium mb-1">價格參考 (Gemini 2.5 Flash):</div>
          <div>• 文字輸入: $0.15/1M tokens</div>
          <div>• 音頻輸入: $0.50/1M tokens</div>
          <div>• 內容輸出: $1.25/1M tokens</div>
          {service_type === 'icon_generator' && (
            <div>• 圖片生成 (Imagen 4 Standard): $0.04/張</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}