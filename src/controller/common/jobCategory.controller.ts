import { Request, Response } from 'express';
import * as Utils from '../../lib/utils';
import jobCategoryService from '../../services/common/jobCategory.service';
import { IRequest } from '../../lib/common.interface';

export default new (class JobCategoryController {
  create = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;

      const args = {
        name: body.name,
        icon: body.icon,
      };

      jobCategoryService
        .createJob(args)
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

  getAll = (req: IRequest, res: Response): void => {
    try {
      jobCategoryService
        .getAllJobCategory()
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

  getById = (req: IRequest, res: Response): Response | void => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res
          .status(Utils.statusCode.BAD_REQUEST)
          .send(Utils.sendErrorResponse({ message: 'Invalid job category ID' }));
      }

      jobCategoryService
        .getJobCategoryById(id)
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

  update = (req: IRequest, res: Response): Response | void => {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body as Record<string, string>;

      if (isNaN(id)) {
        return res
          .status(Utils.statusCode.BAD_REQUEST)
          .send(Utils.sendErrorResponse({ message: 'Invalid job category ID' }));
      }

      const args = {
        name: body.name,
        icon: body.icon,
      };

      jobCategoryService
        .updateJobCategory(id, args)
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

  delete = (req: IRequest, res: Response): Response | void => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res
          .status(Utils.statusCode.BAD_REQUEST)
          .send(Utils.sendErrorResponse({ message: 'Invalid job category ID' }));
      }

      jobCategoryService
        .deleteJobCategory(id)
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
