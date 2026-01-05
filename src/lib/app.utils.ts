// import { CompanyInfo, ICompanyInfo } from '../models/companyInfo.models';

import logger from './logger';
import { ROLE } from '../lib/constants';
import config from '../config/config';
// import { IAdminUser, AdminUser } from '../models/superAdmin.models';

export default new (class AppUtils {
  async init(): Promise<void> {
    // const admin: IAdminUser = await AdminUser.findOne({
    //   where: { role: ROLE.ADMIN.super_admin },
    // });
    // if (!admin) {
    //   await AdminUser.create({
    //     name: config.ADMIN_NAME,
    //     email: config.ADMIN_EMAIL,
    //     role: ROLE.ADMIN.super_admin,
    //     password: config.ADMIN_PASSWORD,
    //   });
    //   logger.info('Admin Credentials saved successfully');
    // }
    // logger.info('App data initialized');
  }
})();
