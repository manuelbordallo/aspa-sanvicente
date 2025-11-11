import prisma from '../config/database';
import { UserGroup } from '@prisma/client';

export interface CreateGroupData {
  name: string;
  userIds: string[];
}

export interface UpdateGroupData {
  name?: string;
  userIds?: string[];
}

class GroupRepository {
  /**
   * Find all groups with members
   */
  async findAll(): Promise<UserGroup[]> {
    return prisma.userGroup.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    }) as Promise<UserGroup[]>;
  }

  /**
   * Find group by ID with members
   */
  async findById(id: string): Promise<UserGroup | null> {
    return prisma.userGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    }) as Promise<UserGroup | null>;
  }

  /**
   * Create group and member relations
   */
  async create(data: CreateGroupData): Promise<UserGroup> {
    return prisma.userGroup.create({
      data: {
        name: data.name,
        members: {
          create: data.userIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    }) as Promise<UserGroup>;
  }

  /**
   * Update group name and members
   */
  async update(id: string, data: UpdateGroupData): Promise<UserGroup> {
    // If userIds are provided, we need to replace all members
    if (data.userIds) {
      // Delete existing members and create new ones in a transaction
      await prisma.$transaction([
        prisma.userGroupMember.deleteMany({
          where: { groupId: id },
        }),
        prisma.userGroupMember.createMany({
          data: data.userIds.map((userId) => ({
            groupId: id,
            userId,
          })),
        }),
      ]);
    }

    // Update group name if provided
    return prisma.userGroup.update({
      where: { id },
      data: {
        name: data.name,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    }) as Promise<UserGroup>;
  }

  /**
   * Delete group (cascade will remove member relations)
   */
  async delete(id: string): Promise<UserGroup> {
    return prisma.userGroup.delete({
      where: { id },
    });
  }

  /**
   * Get user IDs from a group
   */
  async getUserIds(groupId: string): Promise<string[]> {
    const members = await prisma.userGroupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    return members.map((m) => m.userId);
  }
}

export default new GroupRepository();
