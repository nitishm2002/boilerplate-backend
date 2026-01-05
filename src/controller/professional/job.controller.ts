import { Response } from 'express';
import * as Utils from '../../lib/utils';
import professionalJobService from '../../services/professional/job.service';
import { IChangeJobStatus, IRequest, ISearch, SubmitBidData } from '../../lib/common.interface';
import paginationConfig from '../../config/pagination.config';

export default new (class ProfessionalJobController {
  getOpenJobs = (req: IRequest, res: Response): void => {
    try {
      const professionalId = req.user.id;
      const categoryId = req.query.category_id
        ? parseInt(req.query.category_id as string)
        : undefined;
      const args: ISearch = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || paginationConfig.PER_PAGE,
        search: (req.query.search as string) || '',
      };

      professionalJobService
        .getOpenJobs(args, professionalId, categoryId)
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

  likeJob = (req: IRequest, res: Response): void => {
    try {
      const professionalId = req.user.id;
      const jobId = parseInt(req.params.id);

      professionalJobService
        .likeJob(professionalId, jobId)
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

  getLikedJobs = (req: IRequest, res: Response): void => {
    try {
      const professionalId = req.user.id;

      const args: ISearch = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || paginationConfig.PER_PAGE,
        search: (req.query.search as string) || '',
        interested: (() => {
          const val = req.query.interested;
          if (typeof val === 'string') return val === 'true';
          if (typeof val === 'boolean') return val;
          return false;
        })(),
        submitted: (() => {
          const val = req.query.submitted;
          if (typeof val === 'string') return val === 'true';
          if (typeof val === 'boolean') return val;
          return false;
        })(),
        won: (() => {
          const val = req.query.won;
          if (typeof val === 'string') return val === 'true';
          if (typeof val === 'boolean') return val;
          return false;
        })(),
      };

      professionalJobService
        .getLikedJobs(args, professionalId)
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

  submitBid = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, any>;
      const professionalId = req.user.id;
      const jobId =
        typeof req.params.job_id === 'string' ? parseInt(req.params.job_id) : req.params.job_id;

      const args: SubmitBidData = {
        job_id: jobId,
        amount: parseFloat(body.amount),
        currency: body.currency,
        message: body.message,
      };

      professionalJobService
        .submitBid(professionalId, args)
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

  editBid = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, any>;
      const professionalId = req.user.id;
      const job_id =
        typeof req.params.job_id === 'string' ? parseInt(req.params.job_id) : req.params.job_id;

      const args: SubmitBidData = {
        job_id: job_id,
        amount: parseFloat(body.amount),
        message: body.message,
      };

      professionalJobService
        .editBid(professionalId, args)
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

  getJobById = (req: IRequest, res: Response): void => {
    try {
      const professionalId = req.user.id;
      const jobId = parseInt(req.params.job_id, 10);
      if (isNaN(jobId)) {
        Utils.throwError('Invalid job ID');
      }

      professionalJobService
        .getJobById(professionalId, jobId)
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

  getRecentTransactions = (req: IRequest, res: Response): void => {
    try {
      const professionalId = req.user.id;

      const args: ISearch = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || paginationConfig.PER_PAGE,
        search: (req.query.search as string) || '',
      };

      professionalJobService
        .getRecentTransactions(args, professionalId)
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

  startOrCompleteJob = (req: IRequest, res: Response): void => {
    try {
      const jobId = parseInt(req.params.job_id);
      const userId = req.user.id;
      const body = req.body as IChangeJobStatus;

      professionalJobService
        .startOrCompleteJob(userId, jobId, body)
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
