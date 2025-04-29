import { User, Wallet, BarChart3, CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import agent from "@/assets/agent.jpeg"

export function Bento() {
  return (
    <div className="w-full py-12 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge>Platform</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-left">Something new!</h2>
              <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                Managing a small business today is already tough.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-lg h-full lg:col-span-2 p-8 aspect-[4/3] lg:aspect-[2/1] flex justify-between flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 opacity-20">
                <img
                  src={agent}
                  alt="Payment illustration"
                  width={200}
                  height={200}
                  className="object-cover"
                />
              </div>
              <Wallet className="w-8 h-8 stroke-1 text-emerald-300" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight text-white">Pay supplier invoices</h3>
                <p className="text-emerald-100 max-w-xs text-base">
                  Our goal is to streamline SMB trade, making it easier and faster than ever.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-md aspect-square p-6 flex justify-between flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 opacity-20">
                <img
                  src="/placeholder.svg?height=150&width=150"
                  alt="User management illustration"
                  width={150}
                  height={150}
                  className="object-cover"
                />
              </div>
              <User className="w-8 h-8 stroke-1 text-purple-300" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight text-white">User management</h3>
                <p className="text-purple-100 max-w-xs text-base">
                  Our goal is to streamline SMB trade, making it easier and faster than ever.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-900 to-amber-700 rounded-md aspect-square p-6 flex justify-between flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 opacity-20">
                <img
                  src="/placeholder.svg?height=150&width=150"
                  alt="Analytics illustration"
                  width={150}
                  height={150}
                  className="object-cover"
                />
              </div>
              <BarChart3 className="w-8 h-8 stroke-1 text-amber-300" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight text-white">Analytics dashboard</h3>
                <p className="text-amber-100 max-w-xs text-base">
                  Our goal is to streamline SMB trade, making it easier and faster than ever.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-sky-900 to-sky-700 rounded-lg h-full lg:col-span-2 p-8 aspect-[4/3] lg:aspect-[2/1] flex justify-between flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 opacity-20">
                <img
                  src="/placeholder.svg?height=200&width=200"
                  alt="Payment processing illustration"
                  width={200}
                  height={200}
                  className="object-cover"
                />
              </div>
              <CreditCard className="w-8 h-8 stroke-1 text-sky-300" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight text-white">Payment processing</h3>
                <p className="text-sky-100 max-w-xs text-base">
                  Our goal is to streamline SMB trade, making it easier and faster than ever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
