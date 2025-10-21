import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const storeProfileId = searchParams.get('store_profile_id');

    if (eventId) {
      // 特定のイベントの申込一覧を取得
      const applications = await supabaseService.getEventApplications(eventId);
      return NextResponse.json(applications);
    } else if (storeProfileId) {
      // 出店者の申込一覧を取得
      const applications = await supabaseService.getUserEventApplications(storeProfileId);
      return NextResponse.json(applications);
    } else {
      return NextResponse.json({ error: 'event_id or store_profile_id is required' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching event applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      event_id, 
      store_profile_id, 
      store_name, 
      contact_name, 
      phone, 
      email, 
      product_description 
    } = body;

    if (!event_id || !store_profile_id || !store_name || !contact_name) {
      return NextResponse.json({ 
        error: 'event_id, store_profile_id, store_name, and contact_name are required' 
      }, { status: 400 });
    }

    const applicationData = {
      event_id,
      store_profile_id,
      store_name,
      contact_name,
      phone,
      email,
      product_description,
      status: 'pending' as const,
    };

    const application = await supabaseService.createEventApplication(applicationData);
    
    if (!application) {
      return NextResponse.json({ error: 'Failed to create event application' }, { status: 500 });
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating event application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const application = await supabaseService.updateEventApplication(id, updates);
    
    if (!application) {
      return NextResponse.json({ error: 'Failed to update event application' }, { status: 500 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating event application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
