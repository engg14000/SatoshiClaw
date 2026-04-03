import { TelegramGateway } from './TelegramGateway';
import { logger } from '../utils/logger';

// Mock the logger to prevent actual logging during tests
jest.mock('../utils/logger', () => ({
    logger: {
        warn: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
    }
}));

describe('TelegramGateway', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('gracefully ignores empty token', async () => {
        const gateway = new TelegramGateway('');
        await gateway.start();

        expect(logger.warn).toHaveBeenCalledWith('Telegram token not provided. Gateway disabled.');
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
    });
});
