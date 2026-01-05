import { Response } from 'express';
import * as Utils from '../../lib/utils';
import professionalRatingService from '../../services/professional/rating.service';
import { IRequest, RatingData } from '../../lib/common.interface';

export default new (class ProfessionalRatingController {
  createRating = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, any>;
      const userId = req.user.id;

      const args: RatingData = {
        job_id: body.job_id,
        role: req.user.type,
        rating: body.rating,
        professional_id: body.professional_id,
      };

      professionalRatingService
        .createRating(userId, args)
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
