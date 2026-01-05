export const ErrorMsg = {
  PATIENT: { notFound: 'Patient not found', alreadyExist: 'Patient already exists' },
  USER: {
    incorrectOTP: 'Incorrect OTP',
    notFound: 'User not found',
    adminNotFound: 'Admin not found',
    updateFailed: 'Update failed',
    sessionExpire: 'Session Expire',
    noUpdateFields: 'No fields exist',
    patitentNotFound: 'Patient not found',
    emailFound: 'Email already exists',
    emailNotFound: 'Email does not exists',
    requireAuthToken: 'Require Auth Token',
    alreadyExists: 'User already exists',
    changeEmailError: 'Error in change email',
    passwordNotMatch: 'Incorrect old password',
    MobileNoFound: 'Mobile number already exists',
    incorrectCredentials: 'Incorrect credentials',
    phoneNumberFound: 'Phone number already exists',
    accountDeleted: 'Your Account has been deleted',
    accountPending:
      'Your account is pending approval. Once approved by the dealer, you will receive an SMS and email notification and gain full access to the app',
    accountRejected: 'Your account has been rejected. Please contact admin',
    otpNotVerified: 'Please verify OTP before resetting password',
  },
  AUTH: {
    emailExists: 'Email already registered',
    invalidCredentials: 'Invalid email or password',
  },
  EXCEPTIONS: {
    wentWrong: 'Something went Wrong',
  },
  JOBCATEGORY: {
    notFound: 'Job category not found',
    alreadyExists: 'Job category already exists',
  },
  JOB: {
    notFound: 'Job not found',
    alreadyLiked: 'Job already liked',
    bidNotFound: 'Bid not found',
    bidAlreadyAccepted: 'Bid already accepted',
    bidAlreadyRejected: 'Bid already rejected',
    cannotDelete: 'Cannot delete job with accepted bids',
    deleted: 'Job is Deleted by Customer',
    invalidStatus: 'Invalid job status',
    alreadyCompleted: 'Job is already completed',
    cannotStartJob: 'Job cannot be started',
    alreadyStarted: 'Job already started',
    cannotCompleteJob: 'Job cannot be completed',
  },
  RATING: {
    notFound: 'Rating not found',
    alreadyExists: 'You have already rated this job',
    invalidRating: 'Rating must be between 1 and 5',
    acceptedJobNotFound: 'Accepted job not found',
    invalidRole: 'Invalid role. Role must match your user type',
    cannotRate: 'You cannot rate this job',
  },
  CHAT: {
    notFound: 'Chat not found',
    notParticipant: 'You are not a participant in this chat',
    notAuthorize: 'You are not authorized to initiate a chat for this job.',
  },
  DASHBOARD: {
    notFound: 'Data Not Found',
  },
};

export const SuccessMsg = {
  PATIENT: {
    register: 'Patient registration successfully',
    login: 'Login successfully',
    logout: 'Logout successfully',
    get: 'Patient Fetched Successfully',
  },
  DASHBOARD: {
    count: 'Count Fetched Successfully',
    get: 'Data Fetched Successfully',
  },

  AUTH: {
    register: 'Registered successfully',
    login: 'Login successfully',
    logout: 'Logout successfully',
    add: 'User added successfully',
    verify: 'Verified successfully',
    sendOtp: 'OTP sent successfully',
    update: 'User updated successfully',
    profile: 'Profile get successfully',
    profileUpdate: 'Profile updated successfully',
    delete: 'User deleted successfully',
    get: 'User fetch data successfully',
    sendEmail: 'Email sent successfully',
    verifyOTP: 'OTP verified successfully',
    sendRequest: 'Request sent successfully',
    changeEmail: 'Email changed successfully',
    deleteProfile: 'Profile deleted successfully',
    enterMobile: 'Please Enter New Mobile number',
    passwordChange: 'Password changed successfully',
    passwordReset: 'Password reset successfully',
    mobileUpdate: 'Mobile number updated successfully',
    sendLink: 'Recovery account link sent successfully',
    sendChangeMobileRequest: 'Please send request for update mobile number',
  },

  USER: {
    sendOtp: 'OTP sent successfully',
    verifyOTP: 'OTP verified successfully',
    logout: 'Logout successfully',
    delete: 'Profile deleted successfully',
  },
  CUSTOMER: {
    get: 'Customer fetched successfully',
    update: 'Customer updated successfully',
  },
  PROFESSIONAL: {
    get: 'Professional fetched successfully',
    update: 'Professional updated successfully',
  },
  JOBCATEGORY: {
    create: 'Job category created successfully',
    get: 'Job categories fetched successfully',
    update: 'Job category updated successfully',
    delete: 'Job category deleted successfully',
    notFound: 'Job category not found',
    alreadyExists: 'Job category already exists',
  },
  JOB: {
    create: 'Job created successfully',
    get: 'Jobs fetched successfully',
    update: 'Job updated successfully',
    delete: 'Job deleted successfully',
    like: 'Job liked successfully',
    bid: 'Bid submitted successfully',
    acceptBid: 'Bid accepted successfully',
    rejectBid: 'Bid rejected successfully',
    swipe: 'Professional Selected Successfully',
    complete: 'Job marked as completed successfully',
    startJob: 'Job started successfully',
  },
  RATING: {
    create: 'Rating submitted successfully',
    get: 'Ratings fetched successfully',
    update: 'Rating updated successfully',
  },
  CHAT: {
    fetchChats: 'Chats fetched successfully',
    fetchMessages: 'Messages fetched successfully',
    createOrGet: 'Chat fetched/created successfully',
    sendMessage: 'Message sent successfully',
    markRead: 'Messages marked as read',
  },

  NOTIFICATION: {
    get: 'Notification fetched Successfully',
    markAsRead: 'Notification marked as read',
    unreadCount: 'Unread notification count fetched successfully',
    delete: 'All notifications deleted successfully',
  },
  INQUIRY: {
    send: 'Inquiry Added Successfully',
  },
};

export const ROLE = {
  USER: {
    CUSTOMER: 'customer',
    PROFESSIONAL: 'professional',
  },
};

export const OTPType = {
  TYPE: {
    register: 'register',
    login: 'login',
    changeEmail: 'change_email',
    changeMobile: 'change_mobile',
    changePassword: 'change_password',
    forgotPassword: 'forgot_password',
    machineOnboard: 'machine_onboard',
  },
};
export const AccountStatus = {
  STATUS: {
    ACTIVE: 'active',
    PENDING: 'pending',
    DELETED: 'deleted',
    REJECTED: 'rejected',
    REQUESTED: 'requested',
    COMPLETED: 'completed',
  },
};

export const UserType = {
  TYPE: {
    customer: 'customer',
    professional: 'professional',
  },
};

export const JobProgressStatus = {
  STATUS: {
    TASK_POSTED: 'job_posted',
    QUOTE_ACCEPTED: 'quote_accepted',
    CHECK_IN: 'check_in',
    JOB_COMPLETED: 'job_completed',
    REVIEW_PAID: 'review_paid',
  },
};

export const NotificationTemplates = {
  PRO_INTERESTED: (professionalName: string, jobName: string) => ({
    title: 'Job Interest',
    message: `${professionalName} has shown interest in your job: "${jobName}".`,
    notification_type: 'pro_interested',
    type: 'job',
  }),

  QUOTE_RECEIVED: (professionalName: string, jobName: string) => ({
    title: 'New Quote Received',
    message: `${professionalName} submitted a new quote for your job: "${jobName}".`,
    notification_type: 'quote_received',
    type: 'job',
  }),

  QUOTE_ACCEPTED: (jobName: string) => ({
    title: 'Quote Accepted',
    message: `Your quote has been accepted for the job: "${jobName}".`,
    notification_type: 'quote_accepted',
    type: 'job',
  }),

  QUOTE_REJECTED: (jobName: string) => ({
    title: 'Quote Rejected',
    message: `Your quote has been rejected for the job: "${jobName}".`,
    notification_type: 'quote_rejected',
    type: 'job',
  }),

  JOB_STARTED: (professionalName: string, jobName: string) => ({
    title: 'Job Started',
    message: `${professionalName} has started working on your job: "${jobName}".`,
    notification_type: 'job_started',
    type: 'job',
  }),

  JOB_COMPLETED_BY_PROFESSIONAL: (professionalName: string, jobName: string) => ({
    title: 'Job Completed',
    message: `${professionalName} has marked the job "${jobName}" as completed.`,
    notification_type: 'job_completed',
    type: 'job',
  }),

  NEW_CHAT: (senderName: string, message: string) => ({
    title: `${senderName}`,
    message: message,
    notification_type: 'chat',
    type: 'chat',
  }),
};
