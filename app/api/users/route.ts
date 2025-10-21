import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lineUserId = searchParams.get('line_user_id');

    if (!lineUserId) {
      return NextResponse.json({ error: 'line_user_id is required' }, { status: 400 });
    }

    const user = await supabaseService.getUserByLineId(lineUserId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { line_user_id, user_type, name, phone, email } = body;

    if (!line_user_id || !user_type || !name) {
      return NextResponse.json({ 
        error: 'line_user_id, user_type, and name are required' 
      }, { status: 400 });
    }

    const userData = {
      line_user_id,
      user_type,
      name,
      phone,
      email,
    };

    const user = await supabaseService.createUser(userData);
    
    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await supabaseService.updateUser(id, updates);
    
    if (!user) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
