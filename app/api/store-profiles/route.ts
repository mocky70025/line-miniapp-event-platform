import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const profile = await supabaseService.getStoreProfileByUserId(userId);
    
    if (!profile) {
      return NextResponse.json({ error: 'Store profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching store profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      store_name, 
      contact_name, 
      phone, 
      email, 
      address, 
      business_type, 
      description, 
      website, 
      instagram, 
      twitter 
    } = body;

    if (!user_id || !store_name || !contact_name) {
      return NextResponse.json({ 
        error: 'user_id, store_name, and contact_name are required' 
      }, { status: 400 });
    }

    const profileData = {
      user_id,
      store_name,
      contact_name,
      phone,
      email,
      address,
      business_type,
      description,
      website,
      instagram,
      twitter,
      is_verified: false,
      verification_status: 'not_submitted' as const,
    };

    const profile = await supabaseService.createStoreProfile(profileData);
    
    if (!profile) {
      return NextResponse.json({ error: 'Failed to create store profile' }, { status: 500 });
    }

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Error creating store profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    const profile = await supabaseService.updateStoreProfile(id, updates);
    
    if (!profile) {
      return NextResponse.json({ error: 'Failed to update store profile' }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating store profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
