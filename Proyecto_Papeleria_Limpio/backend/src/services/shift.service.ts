import { prisma } from '../lib/prisma';

export class ShiftService {
  /**
   * Get the active shift for a specific user
   */
  static async getActiveShift(userId: number) {
    return prisma.shift.findFirst({
      where: {
        userId,
        status: 'OPEN',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Open a new shift
   */
  static async openShift(userId: number, initialBalance: number) {
    // Check if there is already an open shift
    const existingShift = await this.getActiveShift(userId);
    if (existingShift) {
      const error = new Error('Ya tienes un turno abierto') as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }

    return prisma.shift.create({
      data: {
        userId,
        initialBalance,
        expectedBalance: initialBalance,
        status: 'OPEN',
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Close a shift
   */
  static async closeShift(shiftId: number, actualBalance: number) {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift || shift.status === 'CLOSED') {
      const error = new Error('Turno no encontrado o ya cerrado') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    return prisma.shift.update({
      where: { id: shiftId },
      data: {
        endTime: new Date(),
        actualBalance,
        status: 'CLOSED',
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Update expected balance of a shift (called after each sale)
   */
  static async updateExpectedBalance(shiftId: number, amount: number) {
    return prisma.shift.update({
      where: { id: shiftId },
      data: {
        expectedBalance: {
          increment: amount,
        },
      },
    });
  }
}
