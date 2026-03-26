import type { GHLContactPayload, GHLResponse, GHLTagsResponse, GHLLookupResponse } from './types';

const GHL_API_URL = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

function getHeaders(apiKey: string): Record<string, string> {
  return {
    'Accept': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Version': GHL_API_VERSION,
  };
}

export async function upsertContact(
  payload: GHLContactPayload,
  apiKey: string
): Promise<GHLResponse> {
  try {
    const response = await fetch(`${GHL_API_URL}/contacts/upsert`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify(payload),
    });

    const data = await response.json() as Record<string, unknown>;

    // Success
    if (response.ok) {
      const contact = data.contact as Record<string, unknown> | undefined;
      return {
        success: true,
        contactId: contact?.id as string | undefined,
        isDuplicate: false,
      };
    }

    // Duplicate contact handling (GHL returns 400, 409, or 422 for duplicates)
    if (response.status === 400 || response.status === 409 || response.status === 422) {
      const message = (data.message as string) || '';
      const meta = data.meta as Record<string, unknown> | undefined;
      const contactId = (meta?.contactId ?? meta?.id) as string | undefined;

      if (message.toLowerCase().includes('duplicate') || contactId) {
        return {
          success: true,
          contactId: contactId,
          isDuplicate: true,
        };
      }
    }

    // Other error
    return {
      success: false,
      error: (data.message as string) || `GHL API error: ${response.status}`,
      statusCode: response.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Network error: ${message}`,
    };
  }
}

/**
 * Append tags to an existing contact without overwriting existing tags.
 * Uses the dedicated /contacts/{id}/tags endpoint instead of upsert.
 */
export async function addContactTags(
  contactId: string,
  tags: string[],
  apiKey: string
): Promise<GHLTagsResponse> {
  try {
    const response = await fetch(`${GHL_API_URL}/contacts/${contactId}/tags`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({ tags }),
    });

    if (response.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: `Failed to add tags: ${response.status}`,
      statusCode: response.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Network error: ${message}`,
    };
  }
}

/**
 * Append a note to an existing contact.
 * Used to store secondary form fields (qualification data, survey responses, etc.)
 */
export async function addContactNote(
  contactId: string,
  body: string,
  apiKey: string
): Promise<GHLTagsResponse> {
  try {
    const response = await fetch(`${GHL_API_URL}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({ body }),
    });

    if (response.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: `Failed to add note: ${response.status}`,
      statusCode: response.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Network error: ${message}`,
    };
  }
}

/**
 * Look up a contact by email. Fallback for when upsert doesn't return a contactId.
 */
export async function lookupContactByEmail(
  email: string,
  locationId: string,
  apiKey: string
): Promise<GHLLookupResponse> {
  try {
    const url = `${GHL_API_URL}/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(email)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(apiKey),
    });

    if (response.ok) {
      const data = await response.json() as Record<string, unknown>;
      const contact = data.contact as Record<string, unknown> | undefined;
      return {
        success: true,
        contactId: contact?.id as string | undefined,
      };
    }

    return { success: false };
  } catch {
    return { success: false };
  }
}
