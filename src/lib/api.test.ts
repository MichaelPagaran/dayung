import { describe, it, expect } from 'vitest';
import { api } from './api';

describe('API Client', () => {
    it('should be defined', () => {
        expect(api).toBeDefined();
    });

    it('should have base URL configured', () => {
        expect(api.defaults.baseURL).toBeDefined();
    });
});
