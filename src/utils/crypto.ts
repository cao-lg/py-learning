const SALT = 'py-learning-platform-v1';

export async function generateDeterministicSeed(
  userId: string,
  examId: string
): Promise<string> {
  try {
    // 尝试使用 crypto.subtle.digest API
    const data = new TextEncoder().encode(userId + examId + SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 16);
  } catch (error) {
    console.log('Crypto API not available, using fallback method');
    // 降级方案：使用简单的哈希函数
    let hash = 0;
    const str = userId + examId + SALT;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0').substring(0, 16);
  }
}

export async function generateSubmissionHash(
  code: string,
  timestamp: number,
  seed: string
): Promise<string> {
  const data = new TextEncoder().encode(code + timestamp.toString() + seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function shuffleArray<T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  let seedIndex = 0;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(
      pseudoRandom(seed, seedIndex) * currentIndex
    );
    seedIndex++;
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  return shuffled;
}

function pseudoRandom(seed: string, index: number): number {
  let hash = 0;
  const str = seed + index;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}
