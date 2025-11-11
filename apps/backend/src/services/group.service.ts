import { UserGroup } from '@prisma/client';
import groupRepository, { CreateGroupData, UpdateGroupData } from '../repositories/group.repository';

class GroupService {
  /**
   * Get all groups with members
   */
  async getGroups(): Promise<UserGroup[]> {
    return groupRepository.findAll();
  }

  /**
   * Get group by ID
   */
  async getGroupById(id: string): Promise<UserGroup> {
    const group = await groupRepository.findById(id);

    if (!group) {
      throw new Error('Group not found');
    }

    return group;
  }

  /**
   * Create group with name and member user IDs
   */
  async createGroup(data: CreateGroupData): Promise<UserGroup> {
    // Validate required fields
    if (!data.name) {
      throw new Error('Group name is required');
    }

    if (!data.userIds || data.userIds.length === 0) {
      throw new Error('At least one member is required');
    }

    // Create group
    const group = await groupRepository.create(data);

    return group;
  }

  /**
   * Update group to modify name and members
   */
  async updateGroup(id: string, data: UpdateGroupData): Promise<UserGroup> {
    // Check if group exists
    const existingGroup = await groupRepository.findById(id);

    if (!existingGroup) {
      throw new Error('Group not found');
    }

    // Validate userIds if provided
    if (data.userIds && data.userIds.length === 0) {
      throw new Error('At least one member is required');
    }

    // Update group
    const group = await groupRepository.update(id, data);

    return group;
  }

  /**
   * Delete group
   */
  async deleteGroup(id: string): Promise<void> {
    // Check if group exists
    const existingGroup = await groupRepository.findById(id);

    if (!existingGroup) {
      throw new Error('Group not found');
    }

    // Delete group
    await groupRepository.delete(id);
  }
}

export default new GroupService();
