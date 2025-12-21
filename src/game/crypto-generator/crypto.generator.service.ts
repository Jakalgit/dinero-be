import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import Decimal from 'decimal.js';

@Injectable()
export class CryptoGeneratorService {
  // Генерация случайного числа в диапазоне от min до max включительно
  generateRandomNumber({ min, max }: { min: number; max: number }): number {
    const range = max - min + 1;
    if (range <= 0) {
      throw new Error('Invalid range: max must be greater than min.');
    }

    // Получаем случайный байт (безопасный) и масштабируем в нужный диапазон
    const randomBuffer = randomBytes(4);
    const randomValue = randomBuffer.readUInt32BE(0) / 0xffffffff;

    // Возвращаем число в диапазоне [min, max]
    return new Decimal(randomValue).mul(range).add(new Decimal(min)).toNumber();
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
