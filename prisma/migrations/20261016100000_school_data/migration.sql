-- AlterTable
ALTER TABLE `users` ADD COLUMN `jabatan` VARCHAR(191) NULL,
    ADD COLUMN `notes` TEXT NULL;

-- CreateTable
CREATE TABLE `school_classes` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `level` ENUM('preschool', 'kindergarten') NOT NULL,
    `teacher_id` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `room` VARCHAR(64) NOT NULL,
    `schedule` VARCHAR(191) NOT NULL,
    `age_min_years` INTEGER NOT NULL,
    `age_max_years` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `school_classes_teacher_id_idx`(`teacher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parent_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `relationship` ENUM('mother', 'father', 'guardian') NOT NULL,
    `phone` VARCHAR(64) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` TEXT NULL,
    `occupation` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `parent_profiles_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `place_of_birth` VARCHAR(191) NULL,
    `religion` VARCHAR(64) NULL,
    `gender` ENUM('male', 'female') NOT NULL,
    `class_id` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'inactive', 'alumni') NOT NULL DEFAULT 'active',
    `enrollment_date` DATE NOT NULL,
    `photo_color` VARCHAR(64) NOT NULL,
    `allergies` TEXT NULL,
    `additional_contact` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `students_class_id_idx`(`class_id`),
    INDEX `students_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_parents` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NOT NULL,
    `relationship` ENUM('mother', 'father', 'guardian') NOT NULL,

    INDEX `student_parents_parent_id_idx`(`parent_id`),
    UNIQUE INDEX `student_parents_student_id_parent_id_key`(`student_id`, `parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `class_placements` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `class_id` VARCHAR(191) NOT NULL,
    `class_name` VARCHAR(191) NOT NULL,
    `level` ENUM('preschool', 'kindergarten') NOT NULL,
    `teacher_name` VARCHAR(191) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `note` TEXT NULL,

    INDEX `class_placements_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_documents` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `uploaded_at` DATETIME(3) NOT NULL,
    `kind` VARCHAR(32) NOT NULL DEFAULT 'generic',

    INDEX `student_documents_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registration_applications` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'reviewing', 'form_sent', 'form_submitted', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `submitted_at` DATETIME(3) NOT NULL,
    `notes` TEXT NULL,
    `parent_id` VARCHAR(64) NULL,
    `parent_ids` JSON NULL,
    `parent` JSON NOT NULL,
    `parents` JSON NULL,
    `child` JSON NOT NULL,
    `form_token` VARCHAR(64) NULL,
    `form_sent_at` DATETIME(3) NULL,
    `detailed_form` JSON NULL,
    `detailed_form_submitted_at` DATETIME(3) NULL,
    `registration_fee` JSON NULL,
    `enrolled_student_id` VARCHAR(64) NULL,
    `enrolled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `registration_applications_form_token_key`(`form_token`),
    INDEX `registration_applications_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_day_offs` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('holiday', 'school_off', 'other') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `school_day_offs_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `presence_records` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `class_id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `status` ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    `note` TEXT NULL,
    `recorded_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `presence_records_class_id_date_idx`(`class_id`, `date`),
    UNIQUE INDEX `presence_records_student_id_date_key`(`student_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `class_activities` (
    `id` VARCHAR(191) NOT NULL,
    `class_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `date` DATE NOT NULL,
    `teacher_id` VARCHAR(191) NULL,
    `teacher_name` VARCHAR(191) NOT NULL,
    `images` JSON NOT NULL,
    `video_url` VARCHAR(512) NULL,
    `location` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `class_activities_class_id_date_idx`(`class_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_reports` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `teacher_id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `mood` ENUM('happy', 'ok', 'tired', 'upset') NOT NULL,
    `activities` TEXT NOT NULL,
    `notes` TEXT NOT NULL,
    `skills` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `student_reports_student_id_date_idx`(`student_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tuition_records` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `month` VARCHAR(7) NOT NULL,
    `amount` INTEGER NOT NULL,
    `status` ENUM('paid', 'pending', 'overdue', 'submitted') NOT NULL,
    `due_date` DATE NOT NULL,
    `paid_at` DATETIME(3) NULL,
    `payment_method` ENUM('transfer', 'tunai', 'whatsapp') NULL,
    `proof_url` VARCHAR(512) NULL,
    `proof_status` ENUM('pending', 'approved', 'rejected') NULL,
    `note` TEXT NULL,
    `recorded_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tuition_records_student_id_month_idx`(`student_id`, `month`),
    INDEX `tuition_records_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kas_entries` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `type` ENUM('in', 'out') NOT NULL,
    `account` ENUM('cash', 'bank') NOT NULL,
    `source` ENUM('tuition', 'event', 'donation', 'gift', 'sponsor', 'expense', 'other') NOT NULL,
    `amount` INTEGER NOT NULL,
    `note` TEXT NOT NULL,
    `recorded_by` VARCHAR(191) NOT NULL,
    `tuition_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `kas_entries_date_idx`(`date`),
    INDEX `kas_entries_tuition_id_idx`(`tuition_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_events` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `date` DATE NOT NULL,
    `end_date` DATE NULL,
    `location` VARCHAR(191) NOT NULL,
    `fee_per_child` INTEGER NOT NULL,
    `status` ENUM('upcoming', 'ongoing', 'past') NOT NULL,
    `cover_gradient` VARCHAR(255) NOT NULL,
    `cover_image` VARCHAR(512) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_docs` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(255) NOT NULL,
    `type` ENUM('photo', 'note', 'video') NOT NULL,
    `color` VARCHAR(64) NOT NULL,
    `image_url` VARCHAR(512) NULL,
    `created_at` DATETIME(3) NOT NULL,

    INDEX `event_docs_event_id_idx`(`event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_attendees` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `event_attendees_event_id_student_id_key`(`event_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('owner', 'admin', 'teacher') NOT NULL,
    `permission_id` VARCHAR(64) NOT NULL,
    `access_level` ENUM('none', 'read', 'write') NOT NULL,

    UNIQUE INDEX `role_permissions_role_permission_id_key`(`role`, `permission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `school_classes` ADD CONSTRAINT `school_classes_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `school_classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_parents` ADD CONSTRAINT `student_parents_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_parents` ADD CONSTRAINT `student_parents_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `parent_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_placements` ADD CONSTRAINT `class_placements_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_placements` ADD CONSTRAINT `class_placements_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `school_classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_documents` ADD CONSTRAINT `student_documents_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `presence_records` ADD CONSTRAINT `presence_records_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `presence_records` ADD CONSTRAINT `presence_records_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `school_classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `presence_records` ADD CONSTRAINT `presence_records_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_activities` ADD CONSTRAINT `class_activities_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `school_classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_activities` ADD CONSTRAINT `class_activities_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_reports` ADD CONSTRAINT `student_reports_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_reports` ADD CONSTRAINT `student_reports_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tuition_records` ADD CONSTRAINT `tuition_records_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kas_entries` ADD CONSTRAINT `kas_entries_tuition_id_fkey` FOREIGN KEY (`tuition_id`) REFERENCES `tuition_records`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_docs` ADD CONSTRAINT `event_docs_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `school_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_attendees` ADD CONSTRAINT `event_attendees_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `school_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_attendees` ADD CONSTRAINT `event_attendees_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
