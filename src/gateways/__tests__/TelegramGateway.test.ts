import { TelegramGateway } from '../TelegramGateway';
import { Bot } from 'grammy';
import { logger } from '../../utils/logger';

// Mock the dependencies
jest.mock('grammy', () => {
    return {
        Bot: jest.fn().mockImplementation(() => {
            return {
                command: jest.fn(),
                on: jest.fn(),
                catch: jest.fn(),
                start: jest.fn(),
                stop: jest.fn(),
                api: {
                    sendMessage: jest.fn(),
                },
            };
        }),
    };
});

jest.mock('../../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

describe('TelegramGateway', () => {
    let gateway: TelegramGateway;

    beforeEach(() => {
        jest.clearAllMocks();
        gateway = new TelegramGateway('fake_token');
    });

    it('sendMessage handles API errors', async () => {
        // Start the gateway to initialize the bot
        await gateway.start();

        // Get the mocked Bot instance
        const mockedBotInstance = (Bot as jest.Mock).mock.results[0].value;

        // Mock the sendMessage function to reject with an error
        const mockError = new Error('API Error');
        mockedBotInstance.api.sendMessage.mockRejectedValueOnce(mockError);

        // Call the method under test
        await gateway.sendMessage('12345', 'Hello');

        // Verify that logger.error was called with the correct parameters
        expect(logger.error).toHaveBeenCalledWith(
            'Failed to send Telegram message to 12345:',
            mockError
        );
    });
});
