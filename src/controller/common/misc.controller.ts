import { Request, Response } from 'express';
import * as Utils from '../../lib/utils';
import miscService from '../../services/common/misc.service';
import { IRequest } from '../../lib/common.interface';

export default new (class JobCategoryController {
  createInquiry = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;

      miscService
        .createJob(body)
        .then((result) => {
          res.status(Utils.statusCode.CREATED).send(Utils.sendSuccessResponse(result));
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
