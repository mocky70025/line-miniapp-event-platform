import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizerProfileId = searchParams.get('organizer_profile_id');
    const eventId = searchParams.get('id');

    if (eventId) {
      // 特定のイベントを取得
      const event = await supabaseService.getEventById(eventId);
      
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json(event);
    } else if (organizerProfileId) {
      // 主催者のイベント一覧を取得
      const events = await supabaseService.getEventsByOrganizer(organizerProfileId);
      return NextResponse.json(events);
    } else {
      // 公開されているイベント一覧を取得
      const events = await supabaseService.getPublishedEvents();
      return NextResponse.json(events);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received event data:', body);

    const { 
      organizer_profile_id, 
      title, 
      description, 
      date, 
      start_time, 
      end_time, 
      location, 
      address, 
      max_stores, 
      fee, 
      category, 
      requirements, 
      contact, 
      is_public, 
      application_deadline,
      // 基本情報の拡張
      event_name_kana,
      end_date,
      display_period,
      period_note,
      time,
      application_start_date,
      application_end_date,
      display_application_period,
      application_note,
      lead_text,
      // 会場・連絡先情報
      venue_name,
      postal_code,
      city,
      town,
      street,
      latitude,
      longitude,
      homepage_url,
      related_url,
      contact_name,
      phone,
      email,
      parking,
      fee_text,
      organizer,
      // 画像・その他
      supplement_text,
      main_image_caption,
      additional_image_captions
    } = body;

    if (!organizer_profile_id || !title || !date) {
      return NextResponse.json({ 
        error: 'organizer_profile_id, title, and date are required' 
      }, { status: 400 });
    }

    const eventData = {
      organizer_profile_id,
      title,
      description,
      date,
      start_time,
      end_time,
      location,
      address,
      max_stores,
      fee: fee || 0,
      category,
      requirements,
      contact,
      is_public: is_public !== undefined ? is_public : true,
      application_deadline,
      status: 'draft' as const,
      
      // 基本情報の拡張
      event_name_kana,
      end_date,
      display_period,
      period_note,
      time,
      application_start_date,
      application_end_date,
      display_application_period,
      application_note,
      lead_text,
      
      // 会場・連絡先情報
      venue_name,
      postal_code,
      city,
      town,
      street,
      latitude,
      longitude,
      homepage_url,
      related_url,
      contact_name,
      phone,
      email,
      parking,
      fee_text,
      organizer,
      
      // 画像・その他
      supplement_text,
      main_image_caption,
      additional_image_captions
    };

    console.log('Creating event with data:', eventData);
    const event = await supabaseService.createEvent(eventData);
    
    if (!event) {
      console.error('Failed to create event');
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    console.log('Event created successfully:', event);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const event = await supabaseService.updateEvent(id, updates);
    
    if (!event) {
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
