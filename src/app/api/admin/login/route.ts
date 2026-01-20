import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid admin password' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin login successful',
      token: 'admin-authenticated'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Login failed: ' + error.message },
      { status: 500 }
    )
  }
}
