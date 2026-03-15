import { DB } from '@database';
import { StaffService } from './src/services/staff.service';
import * as fs from 'fs';
import * as path from 'path';

async function testImport() {
  try {
    await DB.sequelize.authenticate();
    console.log('Database connected successfully.');

    const service = new StaffService();
    const filePath = path.resolve(__dirname, '../../thesis/xls/nhansu_full (1).xlsx');
    const fileBuffer = fs.readFileSync(filePath);

    console.log(`Starting import of ${filePath}...`);
    const result = await service.importExcel(fileBuffer);
    
    console.log('Import successful:', result.success);
    if (result.errors.length > 0) {
      console.log('Errors encountered:', result.errors);
    }
  } catch (error) {
    console.error('Test script failed:', error);
  } finally {
    await DB.sequelize.close();
  }
}

testImport();
