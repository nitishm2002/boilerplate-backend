import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';
import bcrypt from 'bcrypt';

const saltRounds = 10;

interface IToken extends Model {
  id?: number;
  user_id: number;
  otp: string;
  email: string;
  otp_type: string;
  user_type: string;
}

const defineTokenModel = (sequelize: Sequelize) => {
  const Token = sequelize.define<IToken>(
    'Token',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value: string) {
          const salt = bcrypt.genSaltSync(saltRounds);
          const hashedOtp = bcrypt.hashSync(value, salt);
          this.setDataValue('otp', hashedOtp);
        },
      },
      otp_type: { type: DataTypes.STRING },
      user_type: { type: DataTypes.STRING },
    },
    {
      timestamps: true,
      tableName: 'token',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );
  return Token;
};

// Initialize the Customer model
const Token = defineTokenModel(sequelize);

export { Token, IToken };
