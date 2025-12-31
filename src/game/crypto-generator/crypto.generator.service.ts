import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class CryptoGeneratorService {
  // Генерация случайного числа в диапазоне от min до max включительно
  generateRandomNumber({ min, max }: { min: number; max: number }): number {
    if (max < min) {
      throw new Error('Invalid range: max must be >= min.');
    }

    const range = max - min + 1;

    // Node.js crypto-safe
    const random = randomBytes(4).readUInt32BE(0);

    // Избегаем modulo bias
    const maxUint32 = 0xffffffff;
    const limit = maxUint32 - (maxUint32 % range);

    let value = random;
    while (value >= limit) {
      value = randomBytes(4).readUInt32BE(0);
    }

    return min + (value % range);
  }

  // Генерация массива случайных чисел
  generateUniqueRandomNumbers({
    count,
    min,
    max,
  }: {
    count: number;
    min: number;
    max: number;
  }): number[] {
    const range = max - min + 1;
    if (count > range) {
      throw new Error(
        'Count must be less than or equal to the number of unique values in range.',
      );
    }

    // Создаем массив чисел от min до max
    const numbers = Array.from({ length: range }, (_, index) => min + index);

    // Перемешиваем массив
    for (let i = numbers.length - 1; i > 0; i--) {
      const randomIndex = this.generateRandomNumber({ min: 0, max: i });
      [numbers[i], numbers[randomIndex]] = [numbers[randomIndex], numbers[i]];
    }

    // Возвращаем первые count элементов из перемешанного массива
    return numbers.slice(0, count);
  }
}
