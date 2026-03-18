import { parentPort } from 'worker_threads';
import { generateRandomKey, isSatoshi } from '../utils/crypto';

if (parentPort) {
  parentPort.on('message', (message) => {
    if (message.type === 'START_MINING') {
      const count = message.count || 100;
      const intervalMs = message.interval || 100;

      setInterval(() => {
        let totalAttempts = 0;
        let satoshiFound = false;
        let foundAddress = '';

        for (let i = 0; i < count; i++) {
          const key = generateRandomKey();
          totalAttempts++;
          if (isSatoshi(key.address)) {
            satoshiFound = true;
            foundAddress = key.address;
          }
        }

        parentPort?.postMessage({
          type: 'MINING_RESULT',
          payload: {
            totalAttempts,
            satoshiFound,
            foundAddress,
            lastAttemptTime: Date.now()
          }
        });
      }, intervalMs);
    } else if (message.type === 'PERFORM_CLAWS') {
      const count = message.count || 1;
      let totalAttempts = 0;
      let satoshiFound = false;
      let foundAddress = '';

      for (let i = 0; i < count; i++) {
        const key = generateRandomKey();
        totalAttempts++;
        if (isSatoshi(key.address)) {
          satoshiFound = true;
          foundAddress = key.address;
        }
      }

      parentPort?.postMessage({
        type: 'MINING_RESULT',
        payload: {
          totalAttempts,
          satoshiFound,
          foundAddress,
          lastAttemptTime: Date.now()
        }
      });
    }
  });
}
