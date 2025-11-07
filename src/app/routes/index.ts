import express from 'express';
const router = express.Router();

const moduleRoutes = [
    {
    path: '/academic-semesters',
    route: "AcademicSemesterRoutes",
  },
];


moduleRoutes.forEach((route => router.use(route.path, route.route)));