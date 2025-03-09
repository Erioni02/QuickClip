import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Check subscription status for premium features
  if (request.nextUrl.pathname.startsWith('/premium')) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.redirect(new URL('/subscription', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/premium/:path*',
    '/settings/:path*',
    '/library/:path*',
    '/verify/:path*'
  ],
}; 