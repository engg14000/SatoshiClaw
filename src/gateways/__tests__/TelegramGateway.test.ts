import { TelegramGateway } from '../TelegramGateway';
import { logger } from '../../utils/logger';
import { Bot } from 'grammy';

jest.mock('../../utils/logger', () => ({
    logger: {
        warn: jest.fn(),
        info: jest.fn(),
        error: jest.fn()
    }
}));

jest.mock('grammy', () => ({
    Bot: jest.fn().mockImplementation(() => ({
        command: jest.fn(),
        on: jest.fn(),
        catch: jest.fn(),
        start: jest.fn()
    }))
}));

describe('TelegramGateway', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('gracefully ignores empty token during start', async () => {
        const gateway = new TelegramGateway('');

        await gateway.start();

        expect(logger.warn).toHaveBeenCalledWith('Telegram token not provided. Gateway disabled.');
        expect(Bot).not.toHaveBeenCalled();
    });
});
