import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (!pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  const adminSession = request.cookies.get('admin_session')?.value
  if (adminSession === 'active') {
    return NextResponse.next()
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export const config = {
  matcher: ['/api/admin/:path*'],
}
