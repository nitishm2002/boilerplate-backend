import { Response } from 'express';
import * as Utils from '../../lib/utils';
import customerJobService from '../../services/customer/job.service';
import {
  IRequest,
  CreateJobData,
  SwipeData,
  ISearch,
  LikeProfessionalData,
} from '../../lib/common.interface';
import paginationConfig from '../../config/pagination.config';

export default new (class CustomerJobController {
  createJob = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, any>;
      const userId = req.user.id;

      const args: CreateJobData = {
        title: body.title,
        description: body.description,
        category_id: body.category_id,
        project_size: body.project_size,
        budget_min: body.budget_min ? parseFloat(body.budget_min) : undefined,
        budget_max: body.budget_max ? parseFloat(body.budget_max) : undefined,
        budget_type: body.budget_type,
        work_finish_type: body.work_finish_type,
        work_finish_from: body.work_finish_from,
        work_finish_to: body.work_finish_to,
        location: body.location,
        images: Array.isArray(body.images) ? body.images : [],
      };

      customerJobService
        .createJob(userId, args)
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

  deleteJob = (req: IRequest, res: Response): void => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = req.user.id;

      customerJobService
        .deleteJob(userId, jobId)
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

  getCustomerJobs = (req: IRequest, res: Response): void => {
    try {
      const userId = req.user.id;
      const args: ISearch = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || paginationConfig.PER_PAGE,
        search: (req.query.search as string) || '',
        status: (req.query.status as string) || '',
      };

      customerJobService
        .getCustomerJobs(args, userId)
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
      const userId = req.user.id;
      const jobId = parseInt(req.params.job_id, 10);

      customerJobService
        .getJobById(jobId, userId)
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

  getJobProfessionals = (req: IRequest, res: Response): void => {
    try {
      const userId = req.user.id;
      const args: ISearch = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || paginationConfig.PER_PAGE,
        search: (req.query.search as string) || '',
        pending: typeof req.query.pending === 'string' ? req.query.pending === 'true' : false,
        accepted: typeof req.query.accepted === 'string' ? req.query.accepted === 'true' : false,
        completed: typeof req.query.completed === 'string' ? req.query.completed === 'true' : false,
      };

      customerJobService
        .getJobProfessionals(args, userId)
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

  getJobProfessionalDetail = (req: IRequest, res: Response): void => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.job_id);
      const professionalId = parseInt(req.params.professional_id);

      customerJobService
        .getJobProfessionalDetail(userId, jobId, professionalId)
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

  acceptBid = (req: IRequest, res: Response): void => {
    try {
      const body = req.body;
      const userId = req.user.id;
      const jobId = parseInt(req.params.job_id);
      const args = {
        bid_id: body.bid_id,
        status: body.status,
      };

      customerJobService
        .acceptOrRejectedBid(userId, jobId, args)
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

  getProfessionalsByCategory = (req: IRequest, res: Response): void => {
    try {
      const args: ISearch = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || paginationConfig.PER_PAGE,
        search: (req.query.search as string) || '',
      };
      const categoryId = parseInt(req.params.job_id);

      customerJobService
        .getProfessionalsByCategory(args, categoryId)
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

  swipeProfessional = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, any>;
      const userId = req.user.id;

      const args: SwipeData = {
        job_id: parseInt(body.job_id),
        professional_id: parseInt(body.professional_id),
      };

      customerJobService
        .swipeProfessional(userId, args)
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

  markJobAsCompleted = (req: IRequest, res: Response): void => {
    try {
      const jobId = parseInt(req.params.job_id);
      const userId = req.user.id;

      customerJobService
        .markJobAsCompleted(userId, jobId)
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
