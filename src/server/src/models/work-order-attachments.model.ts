import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { WorkOrderAttachment } from '@interfaces/work-orders.interface';

export type WorkOrderAttachmentCreationAttributes = Optional<WorkOrderAttachment, 'id' | 'createdAt'>;

export class WorkOrderAttachmentModel
  extends Model<WorkOrderAttachment, WorkOrderAttachmentCreationAttributes>
  implements WorkOrderAttachment
{
  public id: number;
  public workOrderId: number;
  public fileUrl: string;
  public uploadedBy: number;

  public readonly createdAt!: Date;
}

export default function (sequelize: Sequelize): typeof WorkOrderAttachmentModel {
  WorkOrderAttachmentModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      workOrderId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'work_order_id',
        references: { model: 'work_orders', key: 'id' },
      },
      fileUrl: {
        allowNull: false,
        type: DataTypes.STRING(255),
        field: 'file_url',
      },
      uploadedBy: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'uploaded_by',
        references: { model: 'users', key: 'id' },
      },
    },
    {
      tableName: 'work_order_attachments',
      sequelize,
      timestamps: true,
      updatedAt: false,
    },
  );

  return WorkOrderAttachmentModel;
}
