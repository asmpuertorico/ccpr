import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

/**
 * Validates and sanitizes event data
 */
export function validateEventData(data: any): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: any;
} {
  const errors: Record<string, string> = {};
  const sanitizedData: any = {};

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Event name is required';
  } else {
    const trimmed = data.name.trim();
    if (trimmed.length === 0) {
      errors.name = 'Event name cannot be empty';
    } else if (trimmed.length > 200) {
      errors.name = 'Event name must be less than 200 characters';
    } else {
      sanitizedData.name = DOMPurify.sanitize(trimmed);
    }
  }

  // Planner validation
  if (!data.planner || typeof data.planner !== 'string') {
    errors.planner = 'Planner name is required';
  } else {
    const trimmed = data.planner.trim();
    if (trimmed.length === 0) {
      errors.planner = 'Planner name cannot be empty';
    } else if (trimmed.length > 100) {
      errors.planner = 'Planner name must be less than 100 characters';
    } else {
      sanitizedData.planner = DOMPurify.sanitize(trimmed);
    }
  }

  // Date validation
  if (!data.date || typeof data.date !== 'string') {
    errors.date = 'Event date is required';
  } else if (!validator.isDate(data.date)) {
    errors.date = 'Invalid date format';
  } else {
    // Parse date explicitly to avoid timezone issues
    const [year, month, day] = data.date.split("-").map((v: string) => parseInt(v, 10));
    const eventDate = new Date(year, (month ?? 1) - 1, day ?? 1);
    eventDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() < today.getTime()) {
      errors.date = 'Event date cannot be in the past';
    } else {
      sanitizedData.date = data.date;
    }
  }

  // Time validation (optional)
  if (data.time !== undefined && data.time !== null && data.time !== '') {
    if (typeof data.time !== 'string') {
      errors.time = 'Time must be a string';
    } else if (!validator.matches(data.time, /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      errors.time = 'Invalid time format (HH:MM)';
    } else {
      sanitizedData.time = data.time;
    }
  } else {
    sanitizedData.time = '';
  }

  // End date validation (optional, but must be after start date if provided)
  if (data.endDate !== undefined && data.endDate !== null && data.endDate !== '') {
    if (typeof data.endDate !== 'string') {
      errors.endDate = 'End date must be a string';
    } else if (!validator.isDate(data.endDate)) {
      errors.endDate = 'Invalid end date format';
    } else {
      const startDate = new Date(data.date);
      const endDate = new Date(data.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      if (endDate < startDate) {
        errors.endDate = 'End date must be after or equal to start date';
      } else {
        sanitizedData.endDate = data.endDate;
      }
    }
  } else {
    sanitizedData.endDate = '';
  }

  // End time validation (optional, but requires endDate if provided)
  if (data.endTime !== undefined && data.endTime !== null && data.endTime !== '') {
    if (!data.endDate || !data.endDate.trim()) {
      errors.endTime = 'End time requires an end date';
    } else if (typeof data.endTime !== 'string') {
      errors.endTime = 'End time must be a string';
    } else if (!validator.matches(data.endTime, /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      errors.endTime = 'Invalid end time format (HH:MM)';
    } else {
      // If endDate equals start date, endTime should be after start time
      if (data.endDate === data.date && data.time && data.time.trim()) {
        const [startHour, startMinute] = data.time.split(':').map(Number);
        const [endHour, endMinute] = data.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        if (endMinutes <= startMinutes) {
          errors.endTime = 'End time must be after start time when on the same day';
        } else {
          sanitizedData.endTime = data.endTime;
        }
      } else {
        sanitizedData.endTime = data.endTime;
      }
    }
  } else {
    sanitizedData.endTime = '';
  }

  // Image validation (optional)
  if (data.image && typeof data.image === 'string') {
    const trimmed = data.image.trim();
    if (trimmed.length > 0) {
      if (!validator.isURL(trimmed) && !trimmed.startsWith('/images/')) {
        errors.image = 'Image must be a valid URL or local path starting with /images/';
      } else {
        sanitizedData.image = DOMPurify.sanitize(trimmed);
      }
    }
  } else {
    sanitizedData.image = '';
  }

  // Tickets URL validation (optional)
  if (data.ticketsUrl && typeof data.ticketsUrl === 'string') {
    const trimmed = data.ticketsUrl.trim();
    if (trimmed.length > 0) {
      if (!validator.isURL(trimmed, { protocols: ['http', 'https'] })) {
        errors.ticketsUrl = 'Invalid tickets URL';
      } else if (trimmed.length > 500) {
        errors.ticketsUrl = 'Tickets URL is too long';
      } else {
        sanitizedData.ticketsUrl = trimmed;
      }
    }
  } else {
    sanitizedData.ticketsUrl = '';
  }

  // Description validation (optional)
  if (data.description && typeof data.description === 'string') {
    const trimmed = data.description.trim();
    if (trimmed.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    } else {
      sanitizedData.description = DOMPurify.sanitize(trimmed);
    }
  } else {
    sanitizedData.description = '';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['Password is required'],
    };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', 'monkey', '1234567890'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: password // Don't sanitize passwords, just validate
  };
}

/**
 * Sanitizes HTML content
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

/**
 * Validates and sanitizes search query
 */
export function validateSearchQuery(query: string): ValidationResult {
  if (!query || typeof query !== 'string') {
    return {
      isValid: false,
      errors: ['Search query is required'],
    };
  }

  const trimmed = query.trim();
  const errors: string[] = [];

  if (trimmed.length > 100) {
    errors.push('Search query must be less than 100 characters');
  }

  // Remove potentially dangerous characters
  const sanitized = trimmed.replace(/[<>'"&]/g, '');

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}

