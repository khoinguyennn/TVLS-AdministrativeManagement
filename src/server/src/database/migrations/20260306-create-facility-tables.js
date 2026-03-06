module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create buildings table
    await queryInterface.createTable('buildings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      floors: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'maintenance'),
        allowNull: false,
        defaultValue: 'active',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Create rooms table
    await queryInterface.createTable('rooms', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      building_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'buildings',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      floor: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      area: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('classroom', 'lab', 'office', 'meeting', 'storage', 'other'),
        allowNull: false,
        defaultValue: 'classroom',
      },
      status: {
        type: Sequelize.ENUM('available', 'occupied', 'maintenance', 'unavailable'),
        allowNull: false,
        defaultValue: 'available',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Create equipment table
    await queryInterface.createTable('equipment', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      category: {
        type: Sequelize.ENUM('computer', 'projector', 'furniture', 'lab-equipment', 'other'),
        allowNull: false,
        defaultValue: 'other',
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      serial_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      purchase_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      warranty_expiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('working', 'broken', 'maintenance', 'disposed'),
        allowNull: false,
        defaultValue: 'working',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('rooms', ['building_id']);
    await queryInterface.addIndex('equipment', ['room_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('equipment');
    await queryInterface.dropTable('rooms');
    await queryInterface.dropTable('buildings');
  },
};
