import { Response } from 'express';
import * as Utils from '../../lib/utils';
import dashboardService from '../../services/professional/dashboard.service';
import { IRequest, ISearch, SubmitBidData } from '../../lib/common.interface';
import paginationConfig from '../../config/pagination.config';

export default new (class DashboardController {
  Dashboard = (req: IRequest, res: Response): void => {
    try {
      const professionalId = req.user.id;

      dashboardService
        .dashboard(professionalId)
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
