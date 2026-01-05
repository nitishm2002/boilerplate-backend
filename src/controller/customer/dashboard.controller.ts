import { Response } from 'express';
import * as Utils from '../../lib/utils';
import dashboardService from '../../services/customer/dashboard.service';
import { IRequest } from '../../lib/common.interface';

export default new (class DashboardController {
  Dashboard = (req: IRequest, res: Response): void => {
    try {
      const customerId = req.user.id;

      dashboardService
        .dashboard(customerId)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };
})();
