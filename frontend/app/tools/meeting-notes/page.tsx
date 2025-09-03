import AudioUploader from "../../components/AudioUploader"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// 會議筆記工具頁面
export default function MeetingNotesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto">
        {/* 返回按鈕 */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回工具箱
            </Button>
          </Link>
        </div>
        
        {/* 工具內容 */}
        <AudioUploader />
      </div>
    </div>
  )
}